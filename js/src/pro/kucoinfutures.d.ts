import kucoinfuturesRest from '../kucoinfutures.js';
import type { Int, Str, OrderBook, Order, Trade, Ticker, Balances, Position } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class kucoinfutures extends kucoinfuturesRest {
    describe(): any;
    negotiate(privateChannel: any, params?: {}): any;
    negotiateHelper(privateChannel: any, params?: {}): Promise<string>;
    requestId(): any;
    subscribe(url: any, messageHash: any, subscriptionHash: any, subscription: any, params?: {}): Promise<any>;
    subscribeMultiple(url: any, messageHashes: any, topic: any, subscriptionHashes: any, subscription: any, params?: {}): Promise<any>;
    watchTicker(symbol: string, params?: {}): Promise<Ticker>;
    handleTicker(client: Client, message: any): any;
    watchPosition(symbol?: Str, params?: {}): Promise<Position>;
    getCurrentPosition(symbol: any): any;
    setPositionCache(client: Client, symbol: string): void;
    loadPositionSnapshot(client: any, messageHash: any, symbol: any): Promise<void>;
    handlePosition(client: Client, message: any): void;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    watchTradesForSymbols(symbols: string[], since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrade(client: Client, message: any): any;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBookForSymbols(symbols: string[], limit?: Int, params?: {}): Promise<OrderBook>;
    handleDelta(orderbook: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBook(client: Client, message: any): void;
    getCacheIndex(orderbook: any, cache: any): any;
    handleOrderBookSubscription(client: Client, message: any, subscription: any): void;
    handleSubscriptionStatus(client: Client, message: any): void;
    handleSystemStatus(client: Client, message: any): any;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    parseWsOrderStatus(status: any): string;
    parseWsOrder(order: any, market?: any): Order;
    handleOrder(client: Client, message: any): void;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    handleBalanceSubscription(client: Client, message: any, subscription: any): void;
    fetchBalanceSnapshot(client: any, message: any): Promise<void>;
    handleSubject(client: Client, message: any): any;
    ping(client: any): {
        id: any;
        type: string;
    };
    handlePong(client: Client, message: any): any;
    handleErrorMessage(client: Client, message: any): void;
    handleMessage(client: Client, message: any): any;
}
