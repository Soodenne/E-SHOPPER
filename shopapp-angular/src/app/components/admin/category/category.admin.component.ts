import { Component, OnInit, inject } from '@angular/core';
import { Category } from '../../../models/category';
import { ApiResponse } from '../../../responses/api.response';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { BaseComponent } from '../../base/base.component';

@Component({
    selector: 'app-category-admin',
    templateUrl: './category.admin.component.html',
    styleUrls: [
        './category.admin.component.scss',
    ],
    imports: [
        CommonModule,
        FormsModule,
    ]
})
export class CategoryAdminComponent extends BaseComponent implements OnInit {
  categories: Category[] = []; // Dữ liệu động từ categoryService

  ngOnInit() {
    this.getCategories(0, 100);
  }
  getCategories(page: number, limit: number) {
    this.categoryService.getCategories(page, limit).subscribe({
      next: (apiResponse: ApiResponse) => {
        debugger;
        this.categories = apiResponse.data;
      },
      complete: () => {
        debugger;
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.showToast({
          error: error,
          defaultMsg: 'Lỗi tải danh sách danh mục',
          title: 'Lỗi Danh Mục'
        });
      }
    });
  }
  insertCategory() {
    debugger
    // Điều hướng đến trang detail-category với categoryId là tham số
    this.router.navigate(['/admin/categories/insert']);
  }

  // Hàm xử lý sự kiện khi sản phẩm được bấm vào
  updateCategory(categoryId: number) {
    debugger
    this.router.navigate(['/admin/categories/update', categoryId]);
  }
  deleteCategory(category: Category) {
    const confirmation = window
      .confirm('Are you sure you want to delete this category?');
    if (confirmation) {
      debugger
      this.categoryService.deleteCategory(category.id).subscribe({
        next: (apiResponse: ApiResponse) => {
          this.toastService.showToast({
            error: null,
            defaultMsg: 'Xóa danh mục thành công',
            title: 'Thành Công'
          });
          location.reload();
        },
        error: (error: HttpErrorResponse) => {
          this.toastService.showToast({
            error: error,
            defaultMsg: 'Lỗi khi xóa danh mục',
            title: 'Lỗi Xóa'
          });
        }
      });
    }
  }
}