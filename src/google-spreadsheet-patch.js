import {
    GoogleSpreadsheet as BaseGoogleSpreadsheet
} from "google-spreadsheet";
import { JWT } from "google-auth-library";

const GOOGLE_AUTH_SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",

    // the list from the sheets v4 auth for spreadsheets.get
    // 'https://www.googleapis.com/auth/drive',
    // 'https://www.googleapis.com/auth/drive.readonly',
    // 'https://www.googleapis.com/auth/drive.file',
    // 'https://www.googleapis.com/auth/spreadsheets',
    // 'https://www.googleapis.com/auth/spreadsheets.readonly',
];

export class GoogleSpreadsheet extends BaseGoogleSpreadsheet {
    async useServiceAccountAuth(
        creds,
        impersonateAs = null
    ) {
        this.jwtClient = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: GOOGLE_AUTH_SCOPES,
            subject: impersonateAs,
        });
        await this.renewJwtAuth();
    }

    async share(
        email_address,
        perm_type,
        role,
        notify = true,
        email_message = true,
        with_link = false,
    ) {
        const DRIVE_FILES_API_V3_URL = 'https://www.googleapis.com/drive/v3/files';
        const url = `${DRIVE_FILES_API_V3_URL}/${this.spreadsheetId}/permissions`;
        const payload = {
            "emailAddress": email_address,
            "type": perm_type,
            "role": role,
            "withLink": with_link,
        }

        const params = {
            "sendNotificationEmails": notify,
            "emailMessage": email_message,
            "supportsAllDrives": "true",
        }

        await this.axios.post(url, payload, { params });
        return this._spreadsheetUrl;
    }
}
