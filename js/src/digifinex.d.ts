import Exchange from './abstract/digifinex.js';
import { Int, OrderSide } from './base/types.js';
export default class digifinex extends Exchange {
    describe(): any;
    fetchCurrencies(params?: {}): Promise<{}>;
    fetchMarkets(params?: {}): Promise<any[]>;
    fetchMarketsV2(params?: {}): Promise<any[]>;
    fetchMarketsV1(params?: {}): Promise<any[]>;
    parseBalance(response: any): import("./base/types.js").Balances;
    fetchBalance(params?: {}): Promise<import("./base/types.js").Balances>;
    fetchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<import("./base/types.js").OrderBook>;
    fetchTickers(symbols?: string[], params?: {}): Promise<any>;
    fetchTicker(symbol: string, params?: {}): Promise<import("./base/types.js").Ticker>;
    parseTicker(ticker: any, market?: any): import("./base/types.js").Ticker;
    parseTrade(trade: any, market?: any): import("./base/types.js").Trade;
    fetchTime(params?: {}): Promise<number>;
    fetchStatus(params?: {}): Promise<{
        status: string;
        updated: any;
        eta: any;
        url: any;
        info: any;
    }>;
    fetchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseOHLCV(ohlcv: any, market?: any): number[];
    fetchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").OHLCV[]>;
    createOrder(symbol: string, type: any, side: OrderSide, amount: any, price?: any, params?: {}): Promise<any>;
    cancelOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    cancelOrders(ids: any, symbol?: string, params?: {}): Promise<any>;
    parseOrderStatus(status: any): string;
    parseOrder(order: any, market?: any): any;
    fetchOpenOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchOrders(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Order[]>;
    fetchOrder(id: string, symbol?: string, params?: {}): Promise<any>;
    fetchMyTrades(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<import("./base/types.js").Trade[]>;
    parseLedgerEntryType(type: any): string;
    parseLedgerEntry(item: any, currency?: any): {
        info: any;
        id: any;
        direction: any;
        account: any;
        referenceId: any;
        referenceAccount: any;
        type: string;
        currency: any;
        amount: number;
        before: any;
        after: number;
        status: any;
        timestamp: number;
        datetime: string;
        fee: any;
    };
    fetchLedger(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseDepositAddress(depositAddress: any, currency?: any): {
        info: any;
        currency: any;
        address: string;
        tag: string;
        network: any;
    };
    fetchDepositAddress(code: string, params?: {}): Promise<any>;
    fetchTransactionsByType(type: any, code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchDeposits(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchWithdrawals(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseTransactionStatus(status: any): string;
    parseTransaction(transaction: any, currency?: any): {
        info: any;
        id: string;
        txid: string;
        timestamp: number;
        datetime: string;
        network: string;
        address: string;
        addressTo: string;
        addressFrom: any;
        tag: string;
        tagTo: string;
        tagFrom: any;
        type: any;
        amount: number;
        currency: any;
        status: string;
        updated: number;
        fee: any;
    };
    parseTransferStatus(status: any): string;
    parseTransfer(transfer: any, currency?: any): {
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: number;
        fromAccount: any;
        toAccount: any;
        status: string;
    };
    transfer(code: string, amount: any, fromAccount: any, toAccount: any, params?: {}): Promise<{
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        currency: any;
        amount: number;
        fromAccount: any;
        toAccount: any;
        status: string;
    }>;
    withdraw(code: string, amount: any, address: any, tag?: any, params?: {}): Promise<{
        info: any;
        id: string;
        txid: string;
        timestamp: number;
        datetime: string;
        network: string;
        address: string;
        addressTo: string;
        addressFrom: any;
        tag: string;
        tagTo: string;
        tagFrom: any;
        type: any;
        amount: number;
        currency: any;
        status: string;
        updated: number;
        fee: any;
    }>;
    fetchBorrowInterest(code?: string, symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    parseBorrowInterest(info: any, market?: any): {
        account: any;
        currency: any;
        interest: any;
        interestRate: number;
        amountBorrowed: number;
        timestamp: any;
        datetime: any;
        info: any;
    };
    fetchBorrowRate(code: string, params?: {}): Promise<{
        currency: any;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    }>;
    fetchBorrowRates(params?: {}): Promise<{}>;
    parseBorrowRate(info: any, currency?: any): {
        currency: any;
        rate: number;
        period: number;
        timestamp: number;
        datetime: string;
        info: any;
    };
    parseBorrowRates(info: any, codeKey: any): {};
    fetchFundingRate(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: any;
        markPrice: any;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: number;
        fundingDatetime: string;
        nextFundingRate: string;
        nextFundingTimestamp: number;
        nextFundingDatetime: string;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    }>;
    parseFundingRate(contract: any, market?: any): {
        info: any;
        symbol: any;
        markPrice: any;
        indexPrice: any;
        interestRate: any;
        estimatedSettlePrice: any;
        timestamp: any;
        datetime: any;
        fundingRate: number;
        fundingTimestamp: number;
        fundingDatetime: string;
        nextFundingRate: string;
        nextFundingTimestamp: number;
        nextFundingDatetime: string;
        previousFundingRate: any;
        previousFundingTimestamp: any;
        previousFundingDatetime: any;
    };
    fetchFundingRateHistory(symbol?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchTradingFee(symbol: string, params?: {}): Promise<{
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    }>;
    parseTradingFee(fee: any, market?: any): {
        info: any;
        symbol: any;
        maker: number;
        taker: number;
    };
    fetchPositions(symbols?: string[], params?: {}): Promise<any>;
    fetchPosition(symbol: string, params?: {}): Promise<any>;
    parsePosition(position: any, market?: any): {
        info: any;
        id: any;
        symbol: any;
        notional: number;
        marginMode: string;
        liquidationPrice: number;
        entryPrice: number;
        unrealizedPnl: number;
        contracts: number;
        contractSize: number;
        markPrice: number;
        side: string;
        hedged: any;
        timestamp: number;
        datetime: string;
        maintenanceMargin: number;
        maintenanceMarginPercentage: number;
        collateral: any;
        initialMargin: any;
        initialMarginPercentage: any;
        leverage: number;
        marginRatio: number;
        percentage: any;
    };
    setLeverage(leverage: any, symbol?: string, params?: {}): Promise<any>;
    fetchTransfers(code?: string, since?: Int, limit?: Int, params?: {}): Promise<any>;
    fetchLeverageTiers(symbols?: string[], params?: {}): Promise<{}>;
    parseLeverageTiers(response: any, symbols?: string[], marketIdKey?: any): {};
    fetchMarketLeverageTiers(symbol: string, params?: {}): Promise<any[]>;
    parseMarketLeverageTiers(info: any, market?: any): any[];
    handleMarginModeAndParams(methodName: any, params?: {}, defaultValue?: any): any[];
    fetchDepositWithdrawFees(codes?: any, params?: {}): Promise<{}>;
    parseDepositWithdrawFees(response: any, codes?: any, currencyIdKey?: any): {};
    sign(path: any, api?: any[], method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
    handleErrors(statusCode: any, statusText: any, url: any, method: any, responseHeaders: any, responseBody: any, response: any, requestHeaders: any, requestBody: any): any;
}
