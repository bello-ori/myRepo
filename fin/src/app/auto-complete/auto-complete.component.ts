import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Component, EventEmitter, Output, Input, OnInit, ElementRef, Renderer2, ViewChild } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { fromEvent, Observable, of, Subject } from 'rxjs';
import { bufferTime, concatAll, debounceTime, delay, distinctUntilChanged, filter, map, mergeAll, startWith, switchAll, switchMap, tap, throttle, throttleTime } from 'rxjs/operators';

const APIKEY = "e8067b53";

const PARAMS = new HttpParams({
  fromObject: {
    action: "opensearch",
    format: "json",
    origin: "*"
  }
});


@Component({
  selector: 'autocomplete-input',
  templateUrl: './auto-complete.component.html',
  styleUrls: ['./auto-complete.component.css']
})
export class AutoCompleteComponent implements OnInit {
  @Output() onSelect= new EventEmitter();
  @ViewChild('searchInput') searchInput: ElementRef;

  apiResponse: any;
  isSearching: boolean;

  subject = new Subject();

  constructor( private httpClient: HttpClient ) {
    this.isSearching = false;
    this.apiResponse = [];
  }

  ngAfterViewInit() {
    fromEvent(this.searchInput.nativeElement, 'keyup')
    .pipe(

      // get value
      map((event: any) => {
        return event.target.value;
      })
      // character length must be greater then 2
      , filter(res => res.length > 2)
      // Time in milliseconds between key events
      , debounceTime(500)
      // only if previous query is diffent from current   
      , distinctUntilChanged()
    )
    .subscribe((text: string) => {
      this.isSearching = true;
      this.searchGetCall(text).subscribe((res) => {
        this.isSearching = false;
        this.apiResponse = res;
      }, (err) => { 
        this.isSearching = false;
      });

    });
  }

  onClickEvent(evt){
    this.onSelect.emit(evt.srcElement.innerHTML);
    console.log('Click occurs: emitting=>',evt.srcElement.innerHTML);
  }
  ngOnInit() {  }

  keyUpEvent(event: Event){  }

  searchGetCall(term: string) {
    if (term === '') {
      return of([]);
    }
    return this.httpClient.get('http://www.omdbapi.com/?s=' + term + '&apikey=' + APIKEY, { params: PARAMS.set('search', term) })
    .pipe(
      delay(2000)
    );
  }

}