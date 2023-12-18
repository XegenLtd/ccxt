import ascendexRest from '../ascendex.js';
import type { Int, Str, OrderBook, Order, Trade, OHLCV, Balances } from '../base/types.js';
import Client from '../base/ws/Client.js';
export default class ascendex extends ascendexRest {
    describe(): any;
    watchPublic(messageHash: any, params?: {}): Promise<any>;
    watchPrivate(channel: any, messageHash: any, params?: {}): Promise<any>;
    watchOHLCV(symbol: string, timeframe?: string, since?: Int, limit?: Int, params?: {}): Promise<OHLCV[]>;
    handleOHLCV(client: Client, message: any): any;
    watchTrades(symbol: string, since?: Int, limit?: Int, params?: {}): Promise<Trade[]>;
    handleTrades(client: Client, message: any): void;
    watchOrderBook(symbol: string, limit?: Int, params?: {}): Promise<OrderBook>;
    watchOrderBookSnapshot(symbol: string, limit?: Int, params?: {}): Promise<any>;
    handleOrderBookSnapshot(client: Client, message: any): void;
    handleOrderBook(client: Client, message: any): void;
    handleDelta(bookside: any, delta: any): void;
    handleDeltas(bookside: any, deltas: any): void;
    handleOrderBookMessage(client: Client, message: any, orderbook: any): any;
    watchBalance(params?: {}): Promise<Balances>;
    handleBalance(client: Client, message: any): void;
    watchOrders(symbol?: Str, since?: Int, limit?: Int, params?: {}): Promise<Order[]>;
    handleOrder(client: Client, message: any): void;
    parseWsOrder(order: any, market?: any): Order;
    handleErrorMessage(client: Client, message: any): boolean;
    handleAuthenticate(client: Client, message: any): void;
    handleMessage(client: Client, message: any): any;
    handleSubscriptionStatus(client: Client, message: any): any;
    handleOrderBookSubscription(client: Client, message: any): void;
    pong(client: any, message: any): Promise<void>;
    handlePing(client: Client, message: any): void;
    authenticate(url: any, params?: {}): any;
}
