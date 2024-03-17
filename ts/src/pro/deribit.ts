//  ---------------------------------------------------------------------------

import deribitRest from '../deribit.js';
import { NotSupported, ExchangeError, ArgumentsRequired } from '../base/errors.js';
import { ArrayCache, ArrayCacheBySymbolById, ArrayCacheByTimestamp } from '../base/ws/Cache.js';
import { sha256 } from '../static_dependencies/noble-hashes/sha256.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, OHLCV, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';

//  ---------------------------------------------------------------------------

export default class deribit extends deribitRest {
    describe () {
        return this.deepExtend (super.describe (), {
            'has': {
                'ws': true,
                'watchBalance': true,
                'watchTicker': true,
                'watchTickers': false,
                'watchTrades': true,
                'watchTradesForSymbols': true,
                'watchMyTrades': true,
                'watchOrders': true,
                'watchOrderBook': true,
                'watchOrderBookForSymbols': true,
                'watchOHLCV': true,
                'watchOHLCVForSymbols': true,
            },
            'urls': {
                'test': {
                    'ws': 'wss://test.deribit.com/ws/api/v2',
                },
                'api': {
                    'ws': 'wss://www.deribit.com/ws/api/v2',
                },
            },
            'options': {
                'ws': {
                    'timeframes': {
                        '1m': '1',
                        '3m': '3',
                        '5m': '5',
                        '15m': '15',
                        '30m': '30',
                        '1h': '60',
                        '2h': '120',
                        '4h': '180',
                        '6h': '360',
                        '12h': '720',
                        '1d': '1D',
                    },
                    // watchTrades replacement
                    'watchTradesForSymbols': {
                        'interval': '100ms', // 100ms, agg2, raw
                    },
                    // watchOrderBook replacement
                    'watchOrderBookForSymbols': {
                        'interval': '100ms', // 100ms, agg2, raw
                        'useDepthEndpoint': false, // if true, it will use the {books.group.depth.interval} endpoint instead of the {books.interval} endpoint
                        'depth': '20', // 1, 10, 20
                        'group': 'none', // none, 1, 2, 5, 10, 25, 100, 250
                    },
                },
                'currencies': [ 'BTC', 'ETH', 'SOL', 'USDC' ],
            },
            'streaming': {
            },
            'exceptions': {
            },
        });
    }

    requestId () {
        const requestId = this.sum (this.safeInteger (this.options, 'requestId', 0), 1);
        this.options['requestId'] = requestId;
        return requestId;
    }

    async watchBalance (params = {}): Promise<Balances> {
        /**
         * @method
         * @name deribit#watchBalance
         * @see https://docs.deribit.com/#user-portfolio-currency
         * @description watch balance and get the amount of funds available for trading or funds locked in orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [balance structure]{@link https://docs.ccxt.com/#/?id=balance-structure}
         */
        await this.authenticate (params);
        const messageHash = 'balance';
        const url = this.urls['api']['ws'];
        const currencies = this.safeValue (this.options, 'currencies', []);
        const channels = [];
        for (let i = 0; i < currencies.length; i++) {
            const currencyCode = currencies[i];
            channels.push ('user.portfolio.' + currencyCode);
        }
        const subscribe = {
            'jsonrpc': '2.0',
            'method': 'private/subscribe',
            'params': {
                'channels': channels,
            },
            'id': this.requestId (),
        };
        const request = this.deepExtend (subscribe, params);
        return await this.watch (url, messageHash, request, messageHash, request);
    }

    handleBalance (client: Client, message) {
        //
        // subscription
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "user.portfolio.btc",
        //             "data": {
        //                 "total_pl": 0,
        //                 "session_upl": 0,
        //                 "session_rpl": 0,
        //                 "projected_maintenance_margin": 0,
        //                 "projected_initial_margin": 0,
        //                 "projected_delta_total": 0,
        //                 "portfolio_margining_enabled": false,
        //                 "options_vega": 0,
        //                 "options_value": 0,
        //                 "options_theta": 0,
        //                 "options_session_upl": 0,
        //                 "options_session_rpl": 0,
        //                 "options_pl": 0,
        //                 "options_gamma": 0,
        //                 "options_delta": 0,
        //                 "margin_balance": 0.0015,
        //                 "maintenance_margin": 0,
        //                 "initial_margin": 0,
        //                 "futures_session_upl": 0,
        //                 "futures_session_rpl": 0,
        //                 "futures_pl": 0,
        //                 "fee_balance": 0,
        //                 "estimated_liquidation_ratio_map": {},
        //                 "estimated_liquidation_ratio": 0,
        //                 "equity": 0.0015,
        //                 "delta_total_map": {},
        //                 "delta_total": 0,
        //                 "currency": "BTC",
        //                 "balance": 0.0015,
        //                 "available_withdrawal_funds": 0.0015,
        //                 "available_funds": 0.0015
        //             }
        //         }
        //     }
        //
        const params = this.safeValue (message, 'params', {});
        const data = this.safeValue (params, 'data', {});
        this.balance['info'] = data;
        const currencyId = this.safeString (data, 'currency');
        const currencyCode = this.safeCurrencyCode (currencyId);
        const balance = this.parseBalance (data);
        this.balance[currencyCode] = balance;
        const messageHash = 'balance';
        client.resolve (this.balance, messageHash);
    }

    async watchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name deribit#watchTicker
         * @see https://docs.deribit.com/#ticker-instrument_name-interval
         * @description watches a price ticker, a statistical calculation with the information for a specific market.
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {str} [params.interval] specify aggregation and frequency of notifications. Possible values: 100ms, raw
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const url = this.urls['api']['ws'];
        const interval = this.safeString (params, 'interval', '100ms');
        params = this.omit (params, 'interval');
        await this.loadMarkets ();
        if (interval === 'raw') {
            await this.authenticate ();
        }
        const channel = 'ticker.' + market['id'] + '.' + interval;
        const message = {
            'jsonrpc': '2.0',
            'method': 'public/subscribe',
            'params': {
                'channels': [ 'ticker.' + market['id'] + '.' + interval ],
            },
            'id': this.requestId (),
        };
        const request = this.deepExtend (message, params);
        return await this.watch (url, channel, request, channel, request);
    }

    handleTicker (client: Client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "ticker.BTC_USDC-PERPETUAL.raw",
        //             "data": {
        //                 "timestamp": 1655393725040,
        //                 "stats": [Object],
        //                 "state": "open",
        //                 "settlement_price": 21729.5891,
        //                 "open_interest": 164.501,
        //                 "min_price": 20792.9376,
        //                 "max_price": 21426.225,
        //                 "mark_price": 21109.555,
        //                 "last_price": 21132,
        //                 "instrument_name": "BTC_USDC-PERPETUAL",
        //                 "index_price": 21122.3937,
        //                 "funding_8h": -0.00022427,
        //                 "estimated_delivery_price": 21122.3937,
        //                 "current_funding": -0.00010782,
        //                 "best_bid_price": 21106,
        //                 "best_bid_amount": 1.143,
        //                 "best_ask_price": 21113,
        //                 "best_ask_amount": 0.327
        //             }
        //         }
        //     }
        //
        const params = this.safeValue (message, 'params', {});
        const data = this.safeValue (params, 'data', {});
        const marketId = this.safeString (data, 'instrument_name');
        const symbol = this.safeSymbol (marketId);
        const ticker = this.parseTicker (data);
        const messageHash = this.safeString (params, 'channel');
        this.tickers[symbol] = ticker;
        client.resolve (ticker, messageHash);
    }

    async watchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name deribit#watchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://docs.deribit.com/#trades-instrument_name-interval
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {str} [params.interval] specify aggregation and frequency of notifications. Possible values: 100ms, raw
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        params['callerMethodName'] = 'watchTrades';
        return await this.watchTradesForSymbols ([ symbol ], since, limit, params);
    }

    async watchTradesForSymbols (symbols: string[], since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name deribit#watchTradesForSymbols
         * @description get the list of most recent trades for a list of symbols
         * @see https://docs.deribit.com/#trades-instrument_name-interval
         * @param {string[]} symbols unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        let interval = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchTradesForSymbols', 'interval', '100ms');
        if (interval === 'raw') {
            await this.authenticate ();
        }
        const trades = await this.watchMultipleWrapper ('trades', interval, symbols, params);
        if (this.newUpdates) {
            const first = this.safeDict (trades, 0);
            const tradeSymbol = this.safeString (first, 'symbol');
            limit = trades.getLimit (tradeSymbol, limit);
        }
        return this.filterBySinceLimit (trades, since, limit, 'timestamp', true);
    }

    handleTrades (client: Client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "trades.BTC_USDC-PERPETUAL.100ms",
        //             "data": [{
        //                 "trade_seq": 501899,
        //                 "trade_id": "USDC-2436803",
        //                 "timestamp": 1655397355998,
        //                 "tick_direction": 2,
        //                 "price": 21026,
        //                 "mark_price": 21019.9719,
        //                 "instrument_name": "BTC_USDC-PERPETUAL",
        //                 "index_price": 21031.7847,
        //                 "direction": "buy",
        //                 "amount": 0.049
        //             }]
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const channel = this.safeString (params, 'channel', '');
        const parts = channel.split ('.');
        const marketId = this.safeString (parts, 1);
        const interval = this.safeString (parts, 2);
        const symbol = this.safeSymbol (marketId);
        const market = this.safeMarket (marketId);
        const trades = this.safeList (params, 'data', []);
        if (this.safeValue (this.trades, symbol) === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            this.trades[symbol] = new ArrayCache (limit);
        }
        const stored = this.trades[symbol];
        for (let i = 0; i < trades.length; i++) {
            const trade = trades[i];
            const parsed = this.parseTrade (trade, market);
            stored.append (parsed);
        }
        this.trades[symbol] = stored;
        const messageHash = 'trades|' + symbol + '|' + interval;
        client.resolve (this.trades[symbol], messageHash);
    }

    async watchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name deribit#watchMyTrades
         * @description get the list of trades associated with the user
         * @see https://docs.deribit.com/#user-trades-instrument_name-interval
         * @param {string} symbol unified symbol of the market to fetch trades for. Use 'any' to watch all trades
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {str} [params.interval] specify aggregation and frequency of notifications. Possible values: 100ms, raw
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.authenticate (params);
        if (symbol !== undefined) {
            await this.loadMarkets ();
            symbol = this.symbol (symbol);
        }
        const url = this.urls['api']['ws'];
        const interval = this.safeString (params, 'interval', 'raw');
        params = this.omit (params, 'interval');
        const channel = 'user.trades.any.any.' + interval;
        const message = {
            'jsonrpc': '2.0',
            'method': 'private/subscribe',
            'params': {
                'channels': [ channel ],
            },
            'id': this.requestId (),
        };
        const request = this.deepExtend (message, params);
        const trades = await this.watch (url, channel, request, channel, request);
        return this.filterBySymbolSinceLimit (trades, symbol, since, limit, true);
    }

    handleMyTrades (client: Client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "user.trades.any.any.raw",
        //             "data": [{
        //                 "trade_seq": 149546319,
        //                 "trade_id": "219381310",
        //                 "timestamp": 1655421193564,
        //                 "tick_direction": 0,
        //                 "state": "filled",
        //                 "self_trade": false,
        //                 "reduce_only": false,
        //                 "profit_loss": 0,
        //                 "price": 20236.5,
        //                 "post_only": false,
        //                 "order_type": "market",
        //                 "order_id": "46108941243",
        //                 "matching_id": null,
        //                 "mark_price": 20233.96,
        //                 "liquidity": "T",
        //                 "instrument_name": "BTC-PERPETUAL",
        //                 "index_price": 20253.31,
        //                 "fee_currency": "BTC",
        //                 "fee": 2.5e-7,
        //                 "direction": "buy",
        //                 "amount": 10
        //             }]
        //         }
        //     }
        //
        const params = this.safeValue (message, 'params', {});
        const channel = this.safeString (params, 'channel', '');
        const trades = this.safeValue (params, 'data', []);
        let cachedTrades = this.myTrades;
        if (cachedTrades === undefined) {
            const limit = this.safeInteger (this.options, 'tradesLimit', 1000);
            cachedTrades = new ArrayCacheBySymbolById (limit);
        }
        const parsed = this.parseTrades (trades);
        const marketIds = {};
        for (let i = 0; i < parsed.length; i++) {
            const trade = parsed[i];
            cachedTrades.append (trade);
            const symbol = trade['symbol'];
            marketIds[symbol] = true;
        }
        client.resolve (cachedTrades, channel);
    }

    async watchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name deribit#watchOrderBook
         * @see https://docs.deribit.com/#book-instrument_name-group-depth-interval
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.interval] Frequency of notifications. Events will be aggregated over this interval. Possible values: 100ms, raw
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        params['callerMethodName'] = 'watchOrderBook';
        return await this.watchOrderBookForSymbols ([ symbol ], limit, params);
    }

    async watchOrderBookForSymbols (symbols: string[], limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name deribit#watchOrderBookForSymbols
         * @description watches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://docs.deribit.com/#book-instrument_name-group-depth-interval
         * @param {string[]} symbols unified array of symbols
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        let interval = undefined;
        [ interval, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'interval', '100ms');
        if (interval === 'raw') {
            await this.authenticate ();
        }
        let descriptor = '';
        let useDepthEndpoint = undefined; // for more info, see comment in .options
        [ useDepthEndpoint, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'useDepthEndpoint', false);
        if (useDepthEndpoint) {
            let depth = undefined;
            [ depth, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'depth', '20');
            let group = undefined;
            [ group, params ] = this.handleOptionAndParams (params, 'watchOrderBookForSymbols', 'group', 'none');
            descriptor = group + '.' + depth + '.' + interval;
        } else {
            descriptor = interval;
        }
        const orderbook = await this.watchMultipleWrapper ('book', descriptor, symbols, params);
        return orderbook.limit ();
    }

    handleOrderBook (client: Client, message) {
        //
        //  snapshot
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "book.BTC_USDC-PERPETUAL.raw",
        //             "data": {
        //                 "type": "snapshot",
        //                 "timestamp": 1655395057025,
        //                 "instrument_name": "BTC_USDC-PERPETUAL",
        //                 "change_id": 1550694837,
        //                 "bids": [
        //                     ["new", 20987, 0.487],
        //                     ["new", 20986, 0.238],
        //                 ],
        //                 "asks": [
        //                     ["new", 20999, 0.092],
        //                     ["new", 21000, 1.238],
        //                 ]
        //             }
        //         }
        //     }
        //
        //  change
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "book.BTC_USDC-PERPETUAL.raw",
        //             "data": {
        //                 "type": "change",
        //                 "timestamp": 1655395168086,
        //                 "prev_change_id": 1550724481,
        //                 "instrument_name": "BTC_USDC-PERPETUAL",
        //                 "change_id": 1550724483,
        //                 "bids": [
        //                     ["new", 20977, 0.109],
        //                     ["delete", 20975, 0]
        //                 ],
        //                 "asks": []
        //             }
        //         }
        //     }
        //
        const params = this.safeValue (message, 'params', {});
        const data = this.safeValue (params, 'data', {});
        const channel = this.safeString (params, 'channel');
        const parts = channel.split ('.');
        let descriptor = '';
        const partsLength = parts.length;
        const isDetailed = partsLength === 5;
        if (isDetailed) {
            const group = this.safeString (parts, 2);
            const depth = this.safeString (parts, 3);
            const interval = this.safeString (parts, 4);
            descriptor = group + '.' + depth + '.' + interval;
        } else {
            const interval = this.safeString (parts, 2);
            descriptor = interval;
        }
        const marketId = this.safeString (data, 'instrument_name');
        const symbol = this.safeSymbol (marketId);
        const timestamp = this.safeInteger (data, 'timestamp');
        let storedOrderBook = this.safeValue (this.orderbooks, symbol);
        if (storedOrderBook === undefined) {
            storedOrderBook = this.countedOrderBook ();
        }
        const asks = this.safeValue (data, 'asks', []);
        const bids = this.safeValue (data, 'bids', []);
        this.handleDeltas (storedOrderBook['asks'], asks);
        this.handleDeltas (storedOrderBook['bids'], bids);
        storedOrderBook['nonce'] = timestamp;
        storedOrderBook['timestamp'] = timestamp;
        storedOrderBook['datetime'] = this.iso8601 (timestamp);
        storedOrderBook['symbol'] = symbol;
        this.orderbooks[symbol] = storedOrderBook;
        const messageHash = 'book|' + symbol + '|' + descriptor;
        client.resolve (storedOrderBook, messageHash);
    }

    cleanOrderBook (data) {
        const bids = this.safeValue (data, 'bids', []);
        const asks = this.safeValue (data, 'asks', []);
        const cleanedBids = [];
        for (let i = 0; i < bids.length; i++) {
            cleanedBids.push ([ bids[i][1], bids[i][2] ]);
        }
        const cleanedAsks = [];
        for (let i = 0; i < asks.length; i++) {
            cleanedAsks.push ([ asks[i][1], asks[i][2] ]);
        }
        data['bids'] = cleanedBids;
        data['asks'] = cleanedAsks;
        return data;
    }

    handleDelta (bookside, delta) {
        const price = delta[1];
        const amount = delta[2];
        if (delta[0] === 'new' || delta[0] === 'change') {
            bookside.store (price, amount, 1);
        } else if (delta[0] === 'delete') {
            bookside.store (price, amount, 0);
        }
    }

    handleDeltas (bookside, deltas) {
        for (let i = 0; i < deltas.length; i++) {
            this.handleDelta (bookside, deltas[i]);
        }
    }

    async watchOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name deribit#watchOrders
         * @see https://docs.deribit.com/#user-orders-instrument_name-raw
         * @description watches information on multiple orders made by the user
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of order structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure
         */
        await this.loadMarkets ();
        await this.authenticate (params);
        if (symbol !== undefined) {
            symbol = this.symbol (symbol);
        }
        const url = this.urls['api']['ws'];
        const currency = this.safeString (params, 'currency', 'any');
        const interval = this.safeString (params, 'interval', 'raw');
        const kind = this.safeString (params, 'kind', 'any');
        params = this.omit (params, 'interval', 'currency', 'kind');
        const channel = 'user.orders.' + kind + '.' + currency + '.' + interval;
        const message = {
            'jsonrpc': '2.0',
            'method': 'private/subscribe',
            'params': {
                'channels': [ channel ],
            },
            'id': this.requestId (),
        };
        const request = this.deepExtend (message, params);
        const orders = await this.watch (url, channel, request, channel, request);
        if (this.newUpdates) {
            limit = orders.getLimit (symbol, limit);
        }
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit, true);
    }

    handleOrders (client: Client, message) {
        // Does not return a snapshot of current orders
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "user.orders.any.any.raw",
        //             "data": {
        //                 "web": true,
        //                 "time_in_force": "good_til_cancelled",
        //                 "replaced": false,
        //                 "reduce_only": false,
        //                 "profit_loss": 0,
        //                 "price": 50000,
        //                 "post_only": false,
        //                 "order_type": "limit",
        //                 "order_state": "open",
        //                 "order_id": "46094375191",
        //                 "max_show": 10,
        //                 "last_update_timestamp": 1655401625037,
        //                 "label": '',
        //                 "is_liquidation": false,
        //                 "instrument_name": "BTC-PERPETUAL",
        //                 "filled_amount": 0,
        //                 "direction": "sell",
        //                 "creation_timestamp": 1655401625037,
        //                 "commission": 0,
        //                 "average_price": 0,
        //                 "api": false,
        //                 "amount": 10
        //             }
        //         }
        //     }
        //
        if (this.orders === undefined) {
            const limit = this.safeInteger (this.options, 'ordersLimit', 1000);
            this.orders = new ArrayCacheBySymbolById (limit);
        }
        const params = this.safeValue (message, 'params', {});
        const channel = this.safeString (params, 'channel', '');
        const data = this.safeValue (params, 'data', {});
        let orders = [];
        if (Array.isArray (data)) {
            orders = this.parseOrders (data);
        } else {
            const order = this.parseOrder (data);
            orders = [ order ];
        }
        const cachedOrders = this.orders;
        for (let i = 0; i < orders.length; i++) {
            cachedOrders.append (orders[i]);
        }
        client.resolve (this.orders, channel);
    }

    async watchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name deribit#watchOHLCV
         * @see https://docs.deribit.com/#chart-trades-instrument_name-resolution
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        await this.loadMarkets ();
        symbol = this.symbol (symbol);
        const ohlcvs = await this.watchOHLCVForSymbols ([ [ symbol, timeframe ] ], since, limit, params);
        return ohlcvs[symbol][timeframe];
    }

    async watchOHLCVForSymbols (symbolsAndTimeframes: string[][], since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name deribit#watchOHLCVForSymbols
         * @description watches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://docs.deribit.com/#chart-trades-instrument_name-resolution
         * @param {string[][]} symbolsAndTimeframes array of arrays containing unified symbols and timeframes to fetch OHLCV data for, example [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume
         */
        const symbolsLength = symbolsAndTimeframes.length;
        if (symbolsLength === 0 || !Array.isArray (symbolsAndTimeframes[0])) {
            throw new ArgumentsRequired (this.id + " watchOHLCVForSymbols() requires a an array of symbols and timeframes, like  [['BTC/USDT', '1m'], ['LTC/USDT', '5m']]");
        }
        const [ symbol, timeframe, candles ] = await this.watchMultipleWrapper ('chart.trades', undefined, symbolsAndTimeframes, params);
        if (this.newUpdates) {
            limit = candles.getLimit (symbol, limit);
        }
        const filtered = this.filterBySinceLimit (candles, since, limit, 0, true);
        return this.createOHLCVObject (symbol, timeframe, filtered);
    }

    handleOHLCV (client: Client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "chart.trades.BTC_USDC-PERPETUAL.1",
        //             "data": {
        //                 "volume": 0,
        //                 "tick": 1655403420000,
        //                 "open": 20951,
        //                 "low": 20951,
        //                 "high": 20951,
        //                 "cost": 0,
        //                 "close": 20951
        //             }
        //         }
        //     }
        //
        const params = this.safeDict (message, 'params', {});
        const channel = this.safeString (params, 'channel', '');
        const parts = channel.split ('.');
        const marketId = this.safeString (parts, 2);
        const rawTimeframe = this.safeString (parts, 3);
        const market = this.safeMarket (marketId);
        const symbol = market['symbol'];
        const wsOptions = this.safeDict (this.options, 'ws', {});
        const timeframes = this.safeDict (wsOptions, 'timeframes', {});
        const unifiedTimeframe = this.findTimeframe (rawTimeframe, timeframes);
        this.ohlcvs[symbol] = this.safeDict (this.ohlcvs, symbol, {});
        if (this.safeValue (this.ohlcvs[symbol], unifiedTimeframe) === undefined) {
            const limit = this.safeInteger (this.options, 'OHLCVLimit', 1000);
            this.ohlcvs[symbol][unifiedTimeframe] = new ArrayCacheByTimestamp (limit);
        }
        const stored = this.ohlcvs[symbol][unifiedTimeframe];
        const ohlcv = this.safeDict (params, 'data', {});
        // data contains a single OHLCV candle
        const parsed = this.parseWsOHLCV (ohlcv, market);
        stored.append (parsed);
        this.ohlcvs[symbol][unifiedTimeframe] = stored;
        const resolveData = [ symbol, unifiedTimeframe, stored ];
        const messageHash = 'chart.trades|' + symbol + '|' + rawTimeframe;
        client.resolve (resolveData, messageHash);
    }

    parseWsOHLCV (ohlcv, market = undefined): OHLCV {
        //
        //    {
        //        "c": "28909.0",
        //        "o": "28915.4",
        //        "h": "28915.4",
        //        "l": "28896.1",
        //        "v": "27.6919",
        //        "T": 1696687499999,
        //        "t": 1696687440000
        //    }
        //
        return [
            this.safeInteger (ohlcv, 'tick'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async watchMultipleWrapper (channelName: string, channelDescriptor: Str, symbolsArray = undefined, params = {}) {
        await this.loadMarkets ();
        const url = this.urls['api']['ws'];
        const rawSubscriptions = [];
        const messageHashes = [];
        const isOHLCV = (channelName === 'chart.trades');
        const symbols = isOHLCV ? this.getListFromObjectValues (symbolsArray, 0) : symbolsArray;
        this.marketSymbols (symbols, undefined, false);
        for (let i = 0; i < symbolsArray.length; i++) {
            const current = symbolsArray[i];
            let market = undefined;
            if (isOHLCV) {
                market = this.market (current[0]);
                const unifiedTf = current[1];
                const rawTf = this.safeString (this.timeframes, unifiedTf, unifiedTf);
                channelDescriptor = rawTf;
            } else {
                market = this.market (current);
            }
            const message = channelName + '.' + market['id'] + '.' + channelDescriptor;
            rawSubscriptions.push (message);
            messageHashes.push (channelName + '|' + market['symbol'] + '|' + channelDescriptor);
        }
        const request = {
            'jsonrpc': '2.0',
            'method': 'public/subscribe',
            'params': {
                'channels': rawSubscriptions,
            },
            'id': this.requestId (),
        };
        const extendedRequest = this.deepExtend (request, params);
        const maxMessageByteLimit = 32768 - 1; // 'Message Too Big: limit 32768B'
        const jsonedText = this.json (extendedRequest);
        if (jsonedText.length >= maxMessageByteLimit) {
            throw new ExchangeError (this.id + ' requested subscription length over limit, try to reduce symbols amount');
        }
        return await this.watchMultiple (url, messageHashes, extendedRequest, rawSubscriptions);
    }

    handleMessage (client: Client, message) {
        //
        // error
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1,
        //         "error": {
        //             "message": "Invalid params",
        //             "data": {
        //                 "reason": "invalid format",
        //                 "param": "nonce"
        //             },
        //             "code": -32602
        //         },
        //         "usIn": "1655391709417993",
        //         "usOut": "1655391709418049",
        //         "usDiff": 56,
        //         "testnet": false
        //     }
        //
        // subscribe
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 2,
        //         "result": ["ticker.BTC_USDC-PERPETUAL.raw"],
        //         "usIn": "1655393625889396",
        //         "usOut": "1655393625889518",
        //         "usDiff": 122,
        //         "testnet": false
        //     }
        //
        // notification
        //     {
        //         "jsonrpc": "2.0",
        //         "method": "subscription",
        //         "params": {
        //             "channel": "ticker.BTC_USDC-PERPETUAL.raw",
        //             "data": {
        //                 "timestamp": 1655393724752,
        //                 "stats": [Object],
        //                 "state": "open",
        //                 "settlement_price": 21729.5891,
        //                 "open_interest": 164.501,
        //                 "min_price": 20792.9001,
        //                 "max_price": 21426.1864,
        //                 "mark_price": 21109.4757,
        //                 "last_price": 21132,
        //                 "instrument_name": "BTC_USDC-PERPETUAL",
        //                 "index_price": 21122.3937,
        //                 "funding_8h": -0.00022427,
        //                 "estimated_delivery_price": 21122.3937,
        //                 "current_funding": -0.00011158,
        //                 "best_bid_price": 21106,
        //                 "best_bid_amount": 1.143,
        //                 "best_ask_price": 21113,
        //                 "best_ask_amount": 0.402
        //             }
        //         }
        //     }
        //
        const error = this.safeValue (message, 'error');
        if (error !== undefined) {
            throw new ExchangeError (this.id + ' ' + this.json (error));
        }
        const params = this.safeValue (message, 'params');
        const channel = this.safeString (params, 'channel');
        if (channel !== undefined) {
            const parts = channel.split ('.');
            const channelId = this.safeString (parts, 0);
            const userHandlers = {
                'trades': this.handleMyTrades,
                'portfolio': this.handleBalance,
                'orders': this.handleOrders,
            };
            const handlers = {
                'ticker': this.handleTicker,
                'book': this.handleOrderBook,
                'trades': this.handleTrades,
                'chart': this.handleOHLCV,
                'user': this.safeValue (userHandlers, this.safeString (parts, 1)),
            };
            const handler = this.safeValue (handlers, channelId);
            if (handler !== undefined) {
                handler.call (this, client, message);
                return;
            }
            throw new NotSupported (this.id + ' no handler found for this message ' + this.json (message));
        }
        const result = this.safeValue (message, 'result', {});
        const accessToken = this.safeString (result, 'access_token');
        if (accessToken !== undefined) {
            this.handleAuthenticationMessage (client, message);
        }
    }

    handleAuthenticationMessage (client: Client, message) {
        //
        //     {
        //         "jsonrpc": "2.0",
        //         "id": 1,
        //         "result": {
        //             "token_type": "bearer",
        //             "scope": "account:read_write block_trade:read_write connection custody:read_write mainaccount name:ccxt trade:read_write wallet:read_write",
        //             "refresh_token": "1686927372328.1EzFBRmt.logRQWXkPA1oE_Tk0gRsls9Hau7YN6a321XUBnxvR4x6cryhbkKcniUJU-czA8_zKXrqQGpQmfoDwhLIjIsWCvRuu6otbg-LKWlrtTX1GQqLcPaTTHAdZGTMV-HM8HiS03QBd9MIXWRfF53sKj2hdR9nZPZ6MH1XrkpAZPB_peuEEB9wlcc3elzWEZFtCmiy1fnQ8TPHwAJMt3nuUmEcMLt_-F554qrsg_-I66D9xMiifJj4dBemdPfV_PkGPRIwIoKlxDjyv2-xfCw-4eKyo6Hu1m2h6gT1DPOTxSXcBgfBQjpi-_uY3iAIj7U6xjC46PHthEdquhEuCTZl7UfCRZSAWwZA",
        //             "expires_in": 31536000,
        //             "access_token": "1686923272328.1CkwEx-u.qHradpIulmuoeboKMEi8PkQ1_4DF8yFE2zywBTtkD32sruVC53b1HwL5OWRuh2nYAndXff4xuXIMRkkEfMAFCeq24prihxxinoS8DDVkKBxedGx4CUPJFeXjmh7wuRGqQOLg1plXOpbF3fwF2KPEkAuETwcpcVY6K9HUVjutNRfxFe2TR7CvuS9x8TATvoPeu7H1ezYl-LkKSaRifdTXuwituXgp4oDbPRyQLniEBWuYF9rY7qbABxuOJlXI1VZ63u7Bh0mGWei-KeVeqHGNpy6OgrFRPXPxa9_U7vaxCyHW3zZ9959TQ1QUMLWtUX-NLBEv3BT5eCieW9HORYIOKfsgkpd3"
        //         },
        //         "usIn": "1655391872327712",
        //         "usOut": "1655391872328515",
        //         "usDiff": 803,
        //         "testnet": false
        //     }
        //
        const messageHash = 'authenticated';
        client.resolve (message, messageHash);
        return message;
    }

    async authenticate (params = {}) {
        const url = this.urls['api']['ws'];
        const client = this.client (url);
        const time = this.milliseconds ();
        const timeString = this.numberToString (time);
        const nonce = timeString;
        const messageHash = 'authenticated';
        let future = this.safeValue (client.subscriptions, messageHash);
        if (future === undefined) {
            this.checkRequiredCredentials ();
            const requestId = this.requestId ();
            const signature = this.hmac (this.encode (timeString + '\n' + nonce + '\n'), this.encode (this.secret), sha256);
            const request = {
                'jsonrpc': '2.0',
                'id': requestId,
                'method': 'public/auth',
                'params': {
                    'grant_type': 'client_signature',
                    'client_id': this.apiKey,
                    'timestamp': time,
                    'signature': signature,
                    'nonce': nonce,
                    'data': '',
                },
            };
            future = this.watch (url, messageHash, this.extend (request, params));
            client.subscriptions[messageHash] = future;
        }
        return future;
    }
}
