import fetch from 'node-fetch';
import { RequestInit } from 'node-fetch';

interface TrelloCard {
  id: string;
  checkItemStates: string | null;
  closed: boolean;
  dateLastActivity: string;
  desc: string;
  idBoard: string;
  idShort: number;
  name: string | null;
  shortLink: string;
  dueComplete: boolean;
  due: string | null;
  shortUrl: string;
  url: string;
}

interface TrelloAttachment {
  id: string;
  bytes: string;
  date: string;
  edgeColor: string;
  idMember: string;
  isUpload: boolean;
  mimeType: string;
  name: string;
  previews: [];
  url: string;
  pos: number;
}

interface TrelloClientI {
  getCard(shortLink: string): Promise<TrelloCard>;
  getCardAttachments(shortLink: string): Promise<TrelloAttachment[]>;
  addUrlAttachmentToCard(shortLink: string, urlAttachment: string): Promise<TrelloAttachment>;
}

class TrelloClient implements TrelloClientI {
  apiKey: string;
  apiToken: string;
  apiBaseHeaders: object;

  constructor(apiKey: string, apiToken: string) {
    this.apiKey = apiKey;
    this.apiToken = apiToken;
    this.apiBaseHeaders = {
      Accept: 'application/json',
      method: 'GET',
    };
  }

  // https://developer.atlassian.com/cloud/trello/guides/rest-api/authorization/#authorizing-a-client
  private buildApiUrl(path: string, query?: URLSearchParams): string {
    const params = query ? query : new URLSearchParams();

    params.append('key', this.apiKey);
    params.append('token', this.apiToken);

    return `https://api.trello.com/1${path}?${params.toString()}`;
  }

  // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-get
  public getCard(shortLink: string): Promise<TrelloCard> {
    const path = `/cards/${shortLink}`;
    const options = { ...this.apiBaseHeaders };

    return fetch(this.buildApiUrl(path), options as RequestInit)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
        }

        return (await response.json()) as unknown as TrelloCard;
      })
      .catch((error) => error);
  }

  // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-get
  public getCardAttachments(shortLink: string): Promise<TrelloAttachment[]> {
    const path = `/cards/${shortLink}/attachments`;
    const options = { ...this.apiBaseHeaders };

    return fetch(this.buildApiUrl(path), options as RequestInit)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
        }

        return (await response.json()) as unknown as TrelloAttachment[];
      })
      .catch((error) => error);
  }

  // https://developer.atlassian.com/cloud/trello/rest/api-group-cards/#api-cards-id-attachments-post
  public addUrlAttachmentToCard(
    shortLink: string,
    attachmentUrl: string,
  ): Promise<TrelloAttachment> {
    const path = `/cards/${shortLink}/attachments`;
    const options = {
      ...this.apiBaseHeaders,
      method: 'POST',
    };
    const queryParams = new URLSearchParams();
    queryParams.append('url', attachmentUrl);

    return fetch(this.buildApiUrl(path, queryParams), options as RequestInit)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API endpoint ${path} error: ${response.status} ${response.text}`);
        }

        return (await response.json()) as unknown as TrelloAttachment[];
      })
      .catch((error) => error);
  }
}

export { TrelloCard, TrelloAttachment, TrelloClient, TrelloClientI };