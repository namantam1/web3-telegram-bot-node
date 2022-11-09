import { GoogleSpreadsheetWorksheet } from "google-spreadsheet";
import { GoogleSpreadsheet } from "./google-spreadsheet-patch";


const creds = {
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
};

const doc = new GoogleSpreadsheet("1WXeFO8nDRInFmDYb9aLvLpj4BIS87qcI0IGNaKFwtA4");

let info_loaded = false;

async function loadInfo() {
    if (!info_loaded) {
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();
        info_loaded = true;
    }
}


export default class GSpread {
    title: string;
    header: string[];
    sheet: GoogleSpreadsheetWorksheet | null = null;

    constructor(title: string, header: string[]) {
        this.title = title;
        this.header = header;
    }

    async loadSheet() {
        await loadInfo();
        if (!doc.sheetsByTitle.hasOwnProperty(this.title)) {
            this.sheet = await doc.addSheet({title: this.title, headerValues: this.header});
        } else {
            this.sheet = doc.sheetsByTitle[this.title];
        }
    }

    async getRows() {
        const rows = await this.sheet?.getRows();
        return rows?.map(row => {
            const temp: {[x: string]: any} = {};
            this.header.forEach(key => {
                temp[key] = row[key];
            })
            return temp;
        })
    }

    async addRow(values: {[x: string]: any}) {
        await this.sheet?.addRow(values);
    }

}

export async function share(email: string) {
    return doc.share(email, "user", "writer");
}