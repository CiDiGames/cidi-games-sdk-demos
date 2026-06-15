var DEFAULT_BASE_URL = 'http://localhost:3000';
var DEFAULT_TIMEOUT = 15000;

class CidiBackend {
    static configure(options) {
        options = options || {};

        this.baseURL = options.baseURL || DEFAULT_BASE_URL;
        this.timeout = typeof options.timeout === 'number' ? options.timeout : DEFAULT_TIMEOUT;
        this.headers = options.headers || {};

        return this;
    }

    static health() {
        return this.get('/health');
    }

    static verifyTempToken(tempToken) {
        return this.post('/demo/verify', {
            tempToken: tempToken
        });
    }

    static queryBalance(gameToken) {
        return this.get('/demo/balance', {
            gameToken: gameToken
        });
    }

    static createOrder(input) {
        return this.post('/demo/orders', input || {});
    }

    static queryOrder(orderNo) {
        return this.get('/demo/orders/' + encodeURIComponent(orderNo));
    }

    static queryOrderByGameOrderNo(gameOrderNo) {
        return this.get('/demo/orders/by-game-order/' + encodeURIComponent(gameOrderNo));
    }

    static queryOrderRecords(query) {
        return this.get('/demo/order-records', query || {});
    }

    static reportMedal(input) {
        return this.post('/demo/medal/report', input || {});
    }

    static queryMedalOwnership(query) {
        return this.get('/demo/medal/ownership', query || {});
    }

    static reportTournamentScore(input) {
        return this.post('/demo/tournament/score', input || {});
    }

    static reportGameTask(input) {
        return this.post('/demo/task/report', input || {});
    }

    static queryGameTaskResult(query) {
        return this.get('/demo/task/result', query || {});
    }

    static queryReport(reportId) {
        return this.get('/demo/report/' + encodeURIComponent(reportId));
    }

    static get(path, query, options) {
        return this.request(path, this.mergeOptions(options, {
            method: 'GET',
            query: query
        }));
    }

    static post(path, data, options) {
        return this.request(path, this.mergeOptions(options, {
            method: 'POST',
            data: data
        }));
    }

    static request(path, options) {
        options = options || {};

        var fetchApi = this.getFetch();
        if (!fetchApi) {
            return Promise.reject(this.createError('FETCH_NOT_AVAILABLE', 'window.fetch is not available.'));
        }

        var timeout = typeof options.timeout === 'number' ? options.timeout : this.timeout;
        var requestOptions = this.buildRequestOptions(options);
        var requestPromise = fetchApi(this.buildUrl(path, options.query), requestOptions)
            .then(function (response) {
                return CidiBackend.parseResponse(response);
            });

        if (!timeout) {
            return requestPromise.catch(this.handleError);
        }

        var timeoutId = null;
        var timeoutPromise = this.createTimeoutPromise(timeout, function (id) {
            timeoutId = id;
        });

        return Promise.race([
            requestPromise,
            timeoutPromise
        ])
            .then(function (result) {
                clearTimeout(timeoutId);
                return result;
            })
            .catch(function (error) {
                clearTimeout(timeoutId);
                return CidiBackend.handleError(error);
            });
    }

    static buildRequestOptions(options) {
        var headers = this.mergeHeaders(this.headers, options.headers);
        var requestOptions = {
            method: options.method || 'GET',
            headers: headers
        };

        if (typeof options.data !== 'undefined') {
            headers['Content-Type'] = headers['Content-Type'] || 'application/json';
            requestOptions.body = typeof options.data === 'string'
                ? options.data
                : JSON.stringify(options.data);
        }

        return requestOptions;
    }

    static buildUrl(path, query) {
        var url = /^https?:\/\//.test(path) ? path : this.joinUrl(this.baseURL, path);
        var queryString = this.buildQuery(query);

        if (!queryString) {
            return url;
        }

        return url + (url.indexOf('?') === -1 ? '?' : '&') + queryString;
    }

    static joinUrl(baseURL, path) {
        return String(baseURL).replace(/\/+$/, '') + '/' + String(path).replace(/^\/+/, '');
    }

    static buildQuery(query) {
        if (!query) {
            return '';
        }

        var parts = [];
        Object.keys(query).forEach(function (key) {
            var value = query[key];
            if (typeof value === 'undefined' || value === null) {
                return;
            }

            parts.push(encodeURIComponent(key) + '=' + encodeURIComponent(String(value)));
        });

        return parts.join('&');
    }

    static parseResponse(response) {
        return response.text()
            .then(function (text) {
                var body = CidiBackend.parseBody(text);

                if (!response.ok) {
                    throw CidiBackend.createError('HTTP_ERROR', 'Request failed with status ' + response.status, {
                        status: response.status,
                        body: body
                    });
                }

                return body;
            });
    }

    static parseBody(text) {
        if (!text) {
            return null;
        }

        try {
            return JSON.parse(text);
        } catch (error) {
            return text;
        }
    }

    static createTimeoutPromise(timeout, onTimerCreated) {
        return new Promise(function (resolve, reject) {
            var timeoutId = setTimeout(function () {
                reject(CidiBackend.createError('REQUEST_TIMEOUT', 'Request timed out.'));
            }, timeout);

            if (typeof onTimerCreated === 'function') {
                onTimerCreated(timeoutId);
            }
        });
    }

    static mergeOptions(options, defaults) {
        var result = {};
        var key;

        options = options || {};
        defaults = defaults || {};

        for (key in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, key)) {
                result[key] = defaults[key];
            }
        }

        for (key in options) {
            if (Object.prototype.hasOwnProperty.call(options, key)) {
                result[key] = options[key];
            }
        }

        return result;
    }

    static mergeHeaders(baseHeaders, extraHeaders) {
        var headers = {};
        var key;

        baseHeaders = baseHeaders || {};
        extraHeaders = extraHeaders || {};

        for (key in baseHeaders) {
            if (Object.prototype.hasOwnProperty.call(baseHeaders, key)) {
                headers[key] = baseHeaders[key];
            }
        }

        for (key in extraHeaders) {
            if (Object.prototype.hasOwnProperty.call(extraHeaders, key)) {
                headers[key] = extraHeaders[key];
            }
        }

        return headers;
    }

    static getFetch() {
        if (typeof window === 'undefined' || typeof window.fetch !== 'function') {
            return null;
        }

        return window.fetch.bind(window);
    }

    static createError(code, message, extra) {
        var error = new Error(message);
        error.code = code;

        if (extra) {
            Object.keys(extra).forEach(function (key) {
                error[key] = extra[key];
            });
        }

        return error;
    }

    static handleError(error) {
        if (typeof cc !== 'undefined' && cc.error) {
            cc.error('[CIDI Demo Server]', error && error.code, error && error.message);
        }

        return Promise.reject(error);
    }
}

CidiBackend.baseURL = DEFAULT_BASE_URL;
CidiBackend.timeout = DEFAULT_TIMEOUT;
CidiBackend.headers = {};

module.exports = CidiBackend;
