import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../base/base.component';
import { ApiResponse } from '../../responses/api.response';
import { tap, switchMap, catchError, finalize } from 'rxjs/operators';
import { UserResponse } from '../../responses/user/user.response';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-auth-callback',
    templateUrl: './auth-callback.component.html',
    styleUrls: ['./auth-callback.component.scss'],
    imports: [
        // FooterComponent,
        // HeaderComponent,
        CommonModule
    ]
})

export class AuthCallbackComponent extends BaseComponent implements OnInit {  
  userResponse?: UserResponse
  ngOnInit() {
    //Config: OAuth consent screen in Google Console
    //Config: OAuth Client ID in Google Console
    debugger
    const url = this.router.url;
    let loginType: 'google' | 'facebook';
    if (url.includes('/auth/google/callback')) {
      loginType = 'google';
    } else if (url.includes('/auth/facebook/callback')) {
      loginType = 'facebook';
    } else {
      console.error('Không xác định được nhà cung cấp xác thực.');
      return;
    }
    /// Lấy mã xác thực từ URL
    this.activatedRoute.queryParams.subscribe(params => {
      debugger
      const code = params['code'];
      if (code) {
        // Gửi mã này đến server để lấy token
        this.authService.exchangeCodeForToken(code, loginType).pipe(
          tap((response: ApiResponse) => {
            debugger
            // Giả sử API trả về token trong response.data
            const token = response.data.token;
            // Lưu token
            this.tokenService.setToken(token);
          }),
          switchMap((response) => {
            debugger
            const token = response.data.token;
            // Gọi hàm getUserDetail với token
            return this.userService.getUserDetail(token);
            
          })
        ).subscribe({
          next: (apiResponse: ApiResponse) => {
            // Xử lý thông tin người dùng
            debugger
            this.userResponse = {
              ...apiResponse.data,
              date_of_birth: new Date(apiResponse.data.date_of_birth),
            };
            this.userService.saveUserResponseToLocalStorage(this.userResponse);

            // Điều hướng người dùng dựa trên vai trò
            if (this.userResponse?.role.name === 'admin') {
              this.router.navigate(['/admin']);
            } else if (this.userResponse?.role.name === 'user') {
              this.router.navigate(['/']);
            }
          },
          error: (error: HttpErrorResponse) => {
            this.toastService.showToast({
              error: error,
              defaultMsg: 'Lỗi xác thực tài khoản',
              title: 'Lỗi Đăng Nhập'
            });
          },
          complete: () => {
            // Thực hiện các tác vụ khác nếu cần
            this.cartService.refreshCart();
          }
        });
      } else {
        this.toastService.showToast({
          error: null,
          defaultMsg: 'Lỗi hệ thống xác thực',
          title: 'Lỗi Đăng Nhập'
        });
      }
    });
  }
}
