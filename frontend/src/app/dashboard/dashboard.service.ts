import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { valueswa1, valueswr1, valuesp1, valuessmallest, valuesaverage, valueshighest } from "./dataexamples";

@Injectable({
  providedIn: 'root',
})

export class SampleDataService {

  valueswa1: any[] = [];
  valueswr1: any[] = [];
  valuesp1: any[] = [];
  valuessmallest: any = [];
  valuesaverage: any[] = [];
  valueshighest: any[] = [];

  constructor() {
    this.valueswa1 = valueswa1;
    this.valueswr1 = valueswr1;
    this.valuesp1 = valuesp1;
    this.valuessmallest = valuessmallest;
    this.valuesaverage = valuesaverage;
    this.valueshighest = valueshighest;
  }

  getValueswa1(): any[] {
    return valueswa1;
  }

  getValueswr1(): any[] {
    return valueswr1;
  }

  getValuesp1(): any[] {
    return valuesp1;
  }

  getValuesmallest(): any[] {
    return valuessmallest;
  }

  getValuesaverage(): any[] {
    return valuesaverage;
  }

  getValueshighest(): any[] {
    return valueshighest;
  }


}
