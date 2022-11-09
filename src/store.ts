import GSpread from "./gspread";

interface ConstructorInterface {
    title: string;
    header: string[];
    indexKey?: string;
}

export interface StoreInterface {
    setData(key: string, value: any): Promise<void>;
    getData(key: string, value: any): Promise<any>;
}

export class LocalStore implements StoreInterface {
    private data: { [x: string]: any } = {};

    constructor(_: ConstructorInterface) {}

    async setData(key: string, value: any) {
        this.data[key] = value;
    }

    async getData() {
        return this.data;
    }

    async share() {}
}

export class GSpreadStore implements StoreInterface {
    private data: { [x: string]: any } = {};
    private gspread: GSpread;
    private indexKey: string;
    private sheetLoaded = false;

    constructor({ title, header, indexKey }: ConstructorInterface) {
        this.gspread = new GSpread(title, header);
        this.indexKey = indexKey || header[0];

        this.gspread.loadSheet().then(async () => {
            this.sheetLoaded = true;
            const data = await this.gspread.getRows();
            data?.forEach((el) => {
                this.data[el[this.indexKey]] = el;
            });
        });
    }

    private async loadSheet() {
        if (!this.sheetLoaded) {
            await this.gspread.loadSheet();
            this.sheetLoaded = true;
        }
    }

    async setData(key: string | number, value: any) {
        this.data[key] = value;
        this.gspread.addRow(value);
    }

    async getData() {
        await this.loadSheet();
        return this.data;
    }
}

export default GSpreadStore;
