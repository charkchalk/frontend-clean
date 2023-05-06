import { Component, Injectable, OnInit } from "@angular/core";
import { MatPaginatorIntl, PageEvent } from "@angular/material/paginator";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { CourseApiService } from "../../_api/course/course-api.service";
import { CourseQueryService } from "../_query/course-query.service";
import { QueryItem } from "../_query/query-item";

@Injectable()
export class MyCustomPaginatorIntl implements MatPaginatorIntl {
  changes = new Subject<void>();

  firstPageLabel = `First page`;
  itemsPerPageLabel = `Items per page:`;
  lastPageLabel = `Last page`;

  nextPageLabel = "Next page";
  previousPageLabel = "Previous page";

  getRangeLabel(page: number, pageSize: number, length: number): string {
    if (length === 0) {
      return `Page 1 of 1`;
    }
    const amountPages = Math.ceil(length / pageSize);
    return `Page ${page + 1} of ${amountPages}`;
  }
}

@Component({
  selector: "app-course-list",
  templateUrl: "./course-list.component.html",
  styleUrls: ["./course-list.component.scss"],
  providers: [{ provide: MatPaginatorIntl, useClass: MyCustomPaginatorIntl }],
})
export class CourseListComponent implements OnInit {
  loading = true;
  pagination: PaginationStat = {
    total: 1,
    current: 1,
  };
  courses: RawCourse[] = [];
  queries: QueryItem<unknown>[] = [];

  constructor(
    private router: Router,
    private courseApiService: CourseApiService,
    private courseQueryService: CourseQueryService,
  ) {}

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    const queries = this.courseQueryService.queries.slice(0, -1);
    this.queries = JSON.parse(JSON.stringify(queries)) as QueryItem<unknown>[];
    this.search(this.pagination.current);
  }

  search(page: number): void {
    this.courseApiService
      .getAll(this.queries, { page, size: 20 })
      .subscribe(courses => {
        this.pagination = courses.pagination;
        this.courses = courses.content;
        this.loading = false;
      });
  }

  handlePageEvent(event: PageEvent) {
    this.courses = [];
    this.loading = true;
    this.search(event.pageIndex + 1);
  }
}
