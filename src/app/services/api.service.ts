import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, shareReplay } from "rxjs";
import { Codelist } from "../models/codelist";
import { CostingResponse } from "../models/costingResponse";


@Injectable({ providedIn: 'root' })
export class ApiService {

    // private baseUrl: string = 'http://localhost:5006';
    private baseUrl: string = 'https://api.mynamebuilder.com/'

    private diamondQualitiesCache$!: Observable<Codelist[]>;
    private metalColorsCache$!: Observable<Codelist[]>;
    private fontStylesCache$!: Observable<Codelist[]>;
    private letterHeightsCache$!: Observable<Codelist[]>;
    private metalKaratsCache$!: Observable<Codelist[]>;

    constructor(private http: HttpClient) { }

    getBaseUrl(): string {
        return this.baseUrl;
    }

    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    getCosting(
        quantity: number,
        metalColorId: string,
        metalKaratId: string,
        diamondQualityId: string,
        fontStyleId: string,
        letterHeightId: string,
        customName: string,
        companyId: string = ''
    ): Observable<CostingResponse> {
        const url = `${this.baseUrl}/costingV2?quantity=${quantity}&metalColorId=${metalColorId}&metalKaratId=${metalKaratId}&diamondQualityId=${diamondQualityId}&fontStyleId=${fontStyleId}&letterHeightId=${letterHeightId}&customName=${customName}&companyId=${companyId}`;
        return this.http.get<CostingResponse>(url);
    }

    getDiamondQualities(): Observable<Codelist[]> {
        if (!this.diamondQualitiesCache$) {
            const url = `${this.baseUrl}/getdiamondQualityV2`;
            this.diamondQualitiesCache$ = this.http.get<Codelist[]>(url).pipe(shareReplay(1));
        }
        return this.diamondQualitiesCache$;
    }

    getMetalColors(): Observable<Codelist[]> {
        if (!this.metalColorsCache$) {
            const url = `${this.baseUrl}/getmetalColorV2`;
            this.metalColorsCache$ = this.http.get<Codelist[]>(url).pipe(shareReplay(1));
        }
        return this.metalColorsCache$;
    }

    getMetalKarats(): Observable<Codelist[]> {
        if (!this.metalKaratsCache$) {
            const url = `${this.baseUrl}/getMetalKaratV2`;
            this.metalKaratsCache$ = this.http.get<Codelist[]>(url).pipe(shareReplay(1));
        }
        return this.metalKaratsCache$;
    }

    getFontStyles(): Observable<Codelist[]> {
        if (!this.fontStylesCache$) {
            const url = `${this.baseUrl}/getfontStyleV2`;
            this.fontStylesCache$ = this.http.get<Codelist[]>(url).pipe(shareReplay(1));
        }
        return this.fontStylesCache$;
    }

    getLetterHeights(): Observable<Codelist[]> {
        if (!this.letterHeightsCache$) {
            const url = `${this.baseUrl}/getletterHeightV2`;
            this.letterHeightsCache$ = this.http.get<Codelist[]>(url).pipe(shareReplay(1));
        }
        return this.letterHeightsCache$;
    }
}