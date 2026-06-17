const DEFAULT_BASE_URL = 'http://localhost:3000';
const DEFAULT_TIMEOUT = 15000;

type Query = Record<string, string | number | boolean | null | undefined>;
type HeadersMap = Record<string, string>;

type RequestOptions = {
    method?: string;
    query?: Query;
    data?: unknown;
    timeout?: number;
    headers?: HeadersMap;
};

type BackendError = Error & {
    code?: string;
    status?: number;
    body?: unknown;
};

export default class CidiBackend {
    private static baseURL = DEFAULT_BASE_URL;
    private static timeout = DEFAULT_TIMEOUT;
    private static headers: HeadersMap = {};

    static configure(options?: { baseURL?: string; timeout?: number; headers?: HeadersMap }) {
        this.baseURL = options?.baseURL || DEFAULT_BASE_URL;
        this.timeout = typeof options?.timeout === 'number' ? options.timeout : DEFAULT_TIMEOUT;
        this.headers = options?.headers || {};

        return this;
    }

    static health() {
        return this.get('/health');
    }

    static verifyTempToken(tempToken: string) {
        return this.post('/demo/verify', { tempToken });
    }

    static queryBalance(gameToken: string) {
        return this.get('/demo/balance', { gameToken });
    }

    static createOrder(input: unknown) {
        return this.post('/demo/orders', input || {});
    }

    static queryOrder(orderNo: string) {
        return this.get('/demo/orders/' + encodeURIComponent(orderNo));
    }

    static queryOrderByGameOrderNo(gameOrderNo: string) {
        return this.get('/demo/orders/by-game-order/' + encodeURIComponent(gameOrderNo));
    }

    static queryOrderRecords(query?: Query) {
        return this.get('/demo/order-records', query || {});
    }

    static reportMedal(input: unknown) {
        return this.post('/demo/medal/report', input || {});
    }

    static queryMedalOwnership(query?: Query) {
        return this.get('/demo/medal/ownership', query || {});
    }

    static reportTournamentScore(input: unknown) {
        return this.post('/demo/tournament/score', input || {});
    }

    static reportGameTask(input: unknown) {
        return this.post('/demo/task/report', input || {});
    }

    static queryGameTaskResult(query?: Query) {
        return this.get('/demo/task/result', query || {});
    }

    static queryReport(reportId: string) {
        return this.get('/demo/report/' + encodeURIComponent(reportId));
    }

    static get(path: string, query?: Query, options?: RequestOptions) {
        return this.request(path, this.mergeOptions(options, {
            method: 'GET',
            query
        }));
    }

    static post(path: string, data?: unknown, options?: RequestOptions) {
        return this.request(path, this.mergeOptions(options, {
            method: 'POST',
            data
        }));
    }

    static request(path: string, options?: RequestOptions) {
        const fetchApi = this.getFetch();
        if (!fetchApi) {
            return Promise.reject(this.createError('FETCH_NOT_AVAILABLE', 'window.fetch is not available.'));
        }

        const finalOptions = options || {};
        const timeout = typeof finalOptions.timeout === 'number' ? finalOptions.timeout : this.timeout;
        const requestPromise = fetchApi(this.buildUrl(path, finalOptions.query), this.buildRequestOptions(finalOptions))
            .then((response) => CidiBackend.parseResponse(response));

        if (!timeout) {
            return requestPromise.catch(this.handleError);
        }

        let timeoutId = 0;
        const timeoutPromise = this.createTimeoutPromise(timeout, (id) => {
            timeoutId = id;
        });

        return Promise.race([
            requestPromise,
            timeoutPromise
        ])
            .then((result) => {
                clearTimeout(timeoutId);
                return result;
            })
            .catch((error) => {
                clearTimeout(timeoutId);
                return CidiBackend.handleError(error);
            });
    }

    private static buildRequestOptions(options: RequestOptions): RequestInit {
        const headers = this.mergeHeaders(this.headers, options.headers);
        const requestOptions: RequestInit = {
            method: options.method || 'GET',
            headers
        };

        if (typeof options.data !== 'undefined') {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
            requestOptions.body = typeof options.data === 'string'
                ? options.data
                : JSON.stringify(options.data);
        }

        return requestOptions;
    }

    private static buildUrl(path: string, query?: Query): string {
        const url = /^https?:\/\//.test(path) ? path : this.joinUrl(this.baseURL, path);
        const queryString = this.buildQuery(query);

        if (!queryString) {
            return url;
        }

        return url + (url.indexOf('?') === -1 ? '?' : '&') + queryString;
    }

    private static joinUrl(baseURL: string, path: string): string {
        return String(baseURL).replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
    }

    private static buildQuery(query?: Query): string {
        if (!query) {
            return '';
        }

        const parts: string[] = [];
        Object.keys(query).forEach((key) => {
            const value = query[key];
            if (typeof value === 'undefined' || value === null) {
                return;
            }

            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
        });

        return parts.join('&');
    }

    private static parseResponse(response: Response): Promise<unknown> {
        return response.text()
            .then((text) => {
                const body = CidiBackend.parseBody(text);

                if (!response.ok) {
                    throw CidiBackend.createError('HTTP_ERROR', 'Request failed with status ' + response.status, {
                        status: response.status,
                        body
                    });
                }

                return body;
            });
    }

    private static parseBody(text: string): unknown {
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (error) {
            return text;
        }
    }

    private static createTimeoutPromise(timeout: number, onTimerCreated: (timeoutId: number) => void): Promise<never> {
        return new Promise((resolve, reject) => {
            const timeoutId = window.setTimeout(() => {
                reject(CidiBackend.createError('REQUEST_TIMEOUT', 'Request timed out.'));
            }, timeout);

            onTimerCreated(timeoutId);
        });
    }

    private static mergeOptions(options: RequestOptions | undefined, defaults: RequestOptions): RequestOptions {
        return Object.assign({}, defaults || {}, options || {});
    }

    private static mergeHeaders(baseHeaders?: HeadersMap, extraHeaders?: HeadersMap): HeadersMap {
        return Object.assign({}, baseHeaders || {}, extraHeaders || {});
    }

    private static getFetch(): typeof window.fetch | null {
        if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
            return null;
        }

        return window.fetch.bind(window);
    }

    private static createError(code: string, message: string, extra?: Partial<BackendError>): BackendError {
        const error: BackendError = new Error(message);
        error.code = code;

        if (extra) {
            Object.assign(error, extra);
        }

        return error;
    }

    private static handleError(error: BackendError) {
        console.error('[CIDI Demo Server]', error && error.code, error && error.message);
        return Promise.reject(error);
    }
}

