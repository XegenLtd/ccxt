//  ---------------------------------------------------------------------------

import Exchange from './abstract/gate.js';
import { Precise } from './base/Precise.js';
import { TICK_SIZE } from './base/functions/number.js';
import { ExchangeError, BadRequest, ArgumentsRequired, AuthenticationError, PermissionDenied, AccountSuspended, InsufficientFunds, RateLimitExceeded, ExchangeNotAvailable, BadSymbol, InvalidOrder, OrderNotFound, NotSupported, AccountNotEnabled, OrderImmediatelyFillable, BadResponse } from './base/errors.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';
import { Int, OrderSide, OrderType, OHLCV, Trade, FundingRateHistory, OpenInterest, Order, Balances, OrderRequest, FundingHistory, Str, Transaction, Ticker, OrderBook, Tickers, Greeks, Strings, Market, Currency, MarketInterface } from './base/types.js';

/**
 * @class gate
 * @extends Exchange
 */
export default class gate extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'gate',
            'name': 'Gate.io',
            'countries': [ 'KR' ],
            'rateLimit': 50, // 200 requests per 10 second or 50ms
            'version': 'v4',
            'certified': true,
            'pro': true,
            'urls': {
                'logo': 'https://user-images.githubusercontent.com/1294454/31784029-0313c702-b509-11e7-9ccc-bc0da6a0e435.jpg',
                'doc': 'https://www.gate.io/docs/developers/apiv4/en/',
                'www': 'https://gate.io/',
                'api': {
                    'public': {
                        'wallet': 'https://api.gateio.ws/api/v4',
                        'futures': 'https://api.gateio.ws/api/v4',
                        'margin': 'https://api.gateio.ws/api/v4',
                        'delivery': 'https://api.gateio.ws/api/v4',
                        'spot': 'https://api.gateio.ws/api/v4',
                        'options': 'https://api.gateio.ws/api/v4',
                        'sub_accounts': 'https://api.gateio.ws/api/v4',
                        'earn': 'https://api.gateio.ws/api/v4',
                    },
                    'private': {
                        'withdrawals': 'https://api.gateio.ws/api/v4',
                        'wallet': 'https://api.gateio.ws/api/v4',
                        'futures': 'https://api.gateio.ws/api/v4',
                        'margin': 'https://api.gateio.ws/api/v4',
                        'delivery': 'https://api.gateio.ws/api/v4',
                        'spot': 'https://api.gateio.ws/api/v4',
                        'options': 'https://api.gateio.ws/api/v4',
                        'subAccounts': 'https://api.gateio.ws/api/v4',
                        'rebate': 'https://api.gateio.ws/api/v4',
                        'earn': 'https://api.gateio.ws/api/v4',
                    },
                },
                'test': {
                    'public': {
                        'futures': 'https://fx-api-testnet.gateio.ws/api/v4',
                        'delivery': 'https://fx-api-testnet.gateio.ws/api/v4',
                        'options': 'https://fx-api-testnet.gateio.ws/api/v4',
                    },
                    'private': {
                        'futures': 'https://fx-api-testnet.gateio.ws/api/v4',
                        'delivery': 'https://fx-api-testnet.gateio.ws/api/v4',
                        'options': 'https://fx-api-testnet.gateio.ws/api/v4',
                    },
                },
                'referral': {
                    'url': 'https://www.gate.io/signup/2436035',
                    'discount': 0.2,
                },
            },
            'has': {
                'CORS': undefined,
                'spot': true,
                'margin': true,
                'swap': true,
                'future': true,
                'option': true,
                'addMargin': true,
                'cancelAllOrders': true,
                'cancelOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'createOrders': true,
                'createPostOnlyOrder': true,
                'createReduceOnlyOrder': true,
                'createStopLimitOrder': true,
                'createStopMarketOrder': false,
                'createStopOrder': true,
                'editOrder': true,
                'fetchBalance': true,
                'fetchBorrowRateHistories': false,
                'fetchBorrowRateHistory': false,
                'fetchClosedOrders': true,
                'fetchCrossBorrowRate': false,
                'fetchCrossBorrowRates': false,
                'fetchCurrencies': true,
                'fetchDepositAddress': true,
                'fetchDeposits': true,
                'fetchDepositWithdrawFee': 'emulated',
                'fetchDepositWithdrawFees': true,
                'fetchFundingHistory': true,
                'fetchFundingRate': true,
                'fetchFundingRateHistory': true,
                'fetchFundingRates': true,
                'fetchGreeks': true,
                'fetchIndexOHLCV': true,
                'fetchIsolatedBorrowRate': false,
                'fetchIsolatedBorrowRates': false,
                'fetchLedger': true,
                'fetchLeverage': false,
                'fetchLeverageTiers': true,
                'fetchLiquidations': true,
                'fetchMarginMode': false,
                'fetchMarketLeverageTiers': 'emulated',
                'fetchMarkets': true,
                'fetchMarkOHLCV': true,
                'fetchMyLiquidations': true,
                'fetchMySettlementHistory': true,
                'fetchMyTrades': true,
                'fetchNetworkDepositAddress': true,
                'fetchOHLCV': true,
                'fetchOpenInterest': false,
                'fetchOpenInterestHistory': true,
                'fetchOpenOrders': true,
                'fetchOrder': true,
                'fetchOrderBook': true,
                'fetchPosition': true,
                'fetchPositionMode': false,
                'fetchPositions': true,
                'fetchPremiumIndexOHLCV': false,
                'fetchSettlementHistory': true,
                'fetchTicker': true,
                'fetchTickers': true,
                'fetchTime': false,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': true,
                'fetchTransactionFees': true,
                'fetchUnderlyingAssets': true,
                'fetchVolatilityHistory': false,
                'fetchWithdrawals': true,
                'reduceMargin': true,
                'setLeverage': true,
                'setMarginMode': false,
                'setPositionMode': true,
                'signIn': false,
                'transfer': true,
                'withdraw': true,
            },
            'api': {
                'public': {
                    // All public endpoints 200r/10s per endpoint
                    'wallet': {
                        'get': {
                            'currency_chains': 1,
                        },
                    },
                    'spot': {
                        'get': {
                            'currencies': 1,
                            'currencies/{currency}': 1,
                            'currency_pairs': 1,
                            'currency_pairs/{currency_pair}': 1,
                            'tickers': 1,
                            'order_book': 1,
                            'trades': 1,
                            'candlesticks': 1,
                            'time': 1,
                        },
                    },
                    'margin': {
                        'get': {
                            'currency_pairs': 1,
                            'currency_pairs/{currency_pair}': 1,
                            'funding_book': 1,
                            'cross/currencies': 1,
                            'cross/currencies/{currency}': 1,
                            'uni/currency_pairs': 1,
                            'uni/currency_pairs/{currency_pair}': 1,
                        },
                    },
                    'flash_swap': {
                        'get': {
                            'currencies': 1,
                        },
                    },
                    'futures': {
                        'get': {
                            '{settle}/contracts': 1,
                            '{settle}/contracts/{contract}': 1,
                            '{settle}/order_book': 1,
                            '{settle}/trades': 1,
                            '{settle}/candlesticks': 1,
                            '{settle}/premium_index': 1,
                            '{settle}/tickers': 1,
                            '{settle}/funding_rate': 1,
                            '{settle}/insurance': 1,
                            '{settle}/contract_stats': 1,
                            '{settle}/index_constituents/{index}': 1,
                            '{settle}/liq_orders': 1,
                        },
                    },
                    'delivery': {
                        'get': {
                            '{settle}/contracts': 1,
                            '{settle}/contracts/{contract}': 1,
                            '{settle}/order_book': 1,
                            '{settle}/trades': 1,
                            '{settle}/candlesticks': 1,
                            '{settle}/tickers': 1,
                            '{settle}/insurance': 1,
                        },
                    },
                    'options': {
                        'get': {
                            'underlyings': 1,
                            'expirations': 1,
                            'contracts': 1,
                            'contracts/{contract}': 1,
                            'settlements': 1,
                            'settlements/{contract}': 1,
                            'order_book': 1,
                            'tickers': 1,
                            'underlying/tickers/{underlying}': 1,
                            'candlesticks': 1,
                            'underlying/candlesticks': 1,
                            'trades': 1,
                        },
                    },
                    'earn': {
                        'get': {
                            'uni/currencies': 1,
                            'uni/currencies/{currency}': 1,
                        },
                    },
                },
                'private': {
                    // private endpoints default is 150r/10s per endpoint
                    'withdrawals': {
                        'post': {
                            'withdrawals': 20, // 1r/s cost = 20 / 1 = 20
                        },
                        'delete': {
                            'withdrawals/{withdrawal_id}': 1,
                        },
                    },
                    'wallet': {
                        'get': {
                            'deposit_address': 1,
                            'withdrawals': 1,
                            'deposits': 1,
                            'sub_account_transfers': 1,
                            'withdraw_status': 1,
                            'sub_account_balances': 2.5,
                            'sub_account_margin_balances': 2.5,
                            'sub_account_futures_balances': 2.5,
                            'sub_account_cross_margin_balances': 2.5,
                            'saved_address': 1,
                            'fee': 1,
                            'total_balance': 2.5,
                        },
                        'post': {
                            'transfers': 2.5, // 8r/s cost = 20 / 8 = 2.5
                            'sub_account_transfers': 2.5,
                            'sub_account_to_sub_account': 2.5,
                        },
                    },
                    'subAccounts': {
                        'get': {
                            'sub_accounts': 2.5,
                            'sub_accounts/{user_id}': 2.5,
                            'sub_accounts/{user_id}/keys': 2.5,
                            'sub_accounts/{user_id}/keys/{key}': 2.5,
                        },
                        'post': {
                            'sub_accounts': 2.5,
                            'sub_accounts/{user_id}/keys': 2.5,
                            'sub_accounts/{user_id}/lock': 2.5,
                            'sub_accounts/{user_id}/unlock': 2.5,
                        },
                        'put': {
                            'sub_accounts/{user_id}/keys/{key}': 2.5,
                        },
                        'delete': {
                            'sub_accounts/{user_id}/keys/{key}': 2.5,
                        },
                    },
                    'portfolio': {
                        'get': {
                            'accounts': 20 / 15,
                            'account_mode': 20 / 15,
                            'borrowable': 20 / 15,
                            'transferable': 20 / 15,
                            'loans': 20 / 15,
                            'loan_records': 20 / 15,
                            'interest_records': 20 / 15,
                        },
                        'post': {
                            'account_mode': 20 / 15,
                            'loans': 200 / 15, // 15r/10s cost = 20 / 1.5 = 13.33
                        },
                    },
                    'spot': {
                        // default is 200r/10s
                        'get': {
                            'fee': 1,
                            'batch_fee': 1,
                            'accounts': 1,
                            'account_book': 1,
                            'open_orders': 1,
                            'orders': 1,
                            'orders/{order_id}': 1,
                            'my_trades': 1,
                            'price_orders': 1,
                            'price_orders/{order_id}': 1,
                        },
                        'post': {
                            'batch_orders': 0.4,
                            'cross_liquidate_orders': 1,
                            'orders': 0.4,
                            'cancel_batch_orders': 20 / 75,
                            'countdown_cancel_all': 20 / 75,
                            'amend_batch_orders': 0.4,
                            'price_orders': 0.4,
                        },
                        'delete': {
                            'orders': 20 / 75,
                            'orders/{order_id}': 20 / 75,
                            'price_orders': 20 / 75,
                            'price_orders/{order_id}': 20 / 75,
                        },
                        'patch': {
                            'orders/{order_id}': 0.4,
                        },
                    },
                    'margin': {
                        'get': {
                            'accounts': 20 / 15,
                            'account_book': 20 / 15,
                            'funding_accounts': 20 / 15,
                            'auto_repay': 20 / 15,
                            'transferable': 20 / 15,
                            'loans': 20 / 15,
                            'loans/{loan_id}': 20 / 15,
                            'loans/{loan_id}/repayment': 20 / 15,
                            'loan_records': 20 / 15,
                            'loan_records/{loan_record_id}': 20 / 15,
                            'borrowable': 20 / 15,
                            'cross/accounts': 20 / 15,
                            'cross/account_book': 20 / 15,
                            'cross/loans': 20 / 15,
                            'cross/loans/{loan_id}': 20 / 15,
                            'cross/repayments': 20 / 15,
                            'cross/interest_records': 20 / 15,
                            'cross/transferable': 20 / 15,
                            'cross/estimate_rate': 20 / 15,
                            'cross/borrowable': 20 / 15,
                            'uni/estimate_rate': 20 / 15,
                            'uni/loans': 20 / 15,
                            'uni/loan_records': 20 / 15,
                            'uni/interest_records': 20 / 15,
                            'uni/borrowable': 20 / 15,
                        },
                        'post': {
                            'auto_repay': 20 / 15,
                            'loans': 20 / 15,
                            'merged_loans': 20 / 15,
                            'loans/{loan_id}/repayment': 20 / 15,
                            'cross/loans': 20 / 15,
                            'cross/repayments': 20 / 15,
                            'uni/loans': 20 / 15,
                        },
                        'patch': {
                            'loans/{loan_id}': 20 / 15,
                            'loan_records/{loan_record_id}': 20 / 15,
                        },
                        'delete': {
                            'loans/{loan_id}': 20 / 15,
                        },
                    },
                    'flash_swap': {
                        'get': {
                            'currencies': 1,
                            'currency_pairs': 1,
                            'orders': 1,
                            'orders/{order_id}': 1,
                        },
                        'post': {
                            'orders': 1,
                            'orders/preview': 1,
                        },
                    },
                    'futures': {
                        'get': {
                            '{settle}/accounts': 1,
                            '{settle}/account_book': 1,
                            '{settle}/positions': 1,
                            '{settle}/positions/{contract}': 1,
                            '{settle}/dual_comp/positions/{contract}': 1,
                            '{settle}/orders': 1,
                            '{settle}/orders_timerange': 1,
                            '{settle}/orders/{order_id}': 1,
                            '{settle}/my_trades': 1,
                            '{settle}/my_trades_timerange': 1,
                            '{settle}/position_close': 1,
                            '{settle}/liquidates': 1,
                            '{settle}/auto_deleverages': 1,
                            '{settle}/fee': 1,
                            '{settle}/price_orders': 1,
                            '{settle}/price_orders/{order_id}': 1,
                        },
                        'post': {
                            '{settle}/positions/{contract}/margin': 1,
                            '{settle}/positions/{contract}/leverage': 1,
                            '{settle}/positions/{contract}/risk_limit': 1,
                            '{settle}/dual_mode': 1,
                            '{settle}/dual_comp/positions/{contract}/margin': 1,
                            '{settle}/dual_comp/positions/{contract}/leverage': 1,
                            '{settle}/dual_comp/positions/{contract}/risk_limit': 1,
                            '{settle}/orders': 0.4,
                            '{settle}/batch_orders': 0.4,
                            '{settle}/countdown_cancel_all': 0.4,
                            '{settle}/price_orders': 0.4,
                        },
                        'put': {
                            '{settle}/orders/{order_id}': 1,
                        },
                        'delete': {
                            '{settle}/orders': 20 / 75,
                            '{settle}/orders/{order_id}': 20 / 75,
                            '{settle}/price_orders': 20 / 75,
                            '{settle}/price_orders/{order_id}': 20 / 75,
                        },
                    },
                    'delivery': {
                        'get': {
                            '{settle}/accounts': 20 / 15,
                            '{settle}/account_book': 20 / 15,
                            '{settle}/positions': 20 / 15,
                            '{settle}/positions/{contract}': 20 / 15,
                            '{settle}/orders': 20 / 15,
                            '{settle}/orders/{order_id}': 20 / 15,
                            '{settle}/my_trades': 20 / 15,
                            '{settle}/position_close': 20 / 15,
                            '{settle}/liquidates': 20 / 15,
                            '{settle}/settlements': 20 / 15,
                            '{settle}/price_orders': 20 / 15,
                            '{settle}/price_orders/{order_id}': 20 / 15,
                        },
                        'post': {
                            '{settle}/positions/{contract}/margin': 20 / 15,
                            '{settle}/positions/{contract}/leverage': 20 / 15,
                            '{settle}/positions/{contract}/risk_limit': 20 / 15,
                            '{settle}/orders': 20 / 15,
                            '{settle}/price_orders': 20 / 15,
                        },
                        'delete': {
                            '{settle}/orders': 20 / 15,
                            '{settle}/orders/{order_id}': 20 / 15,
                            '{settle}/price_orders': 20 / 15,
                            '{settle}/price_orders/{order_id}': 20 / 15,
                        },
                    },
                    'options': {
                        'get': {
                            'my_settlements': 20 / 15,
                            'accounts': 20 / 15,
                            'account_book': 20 / 15,
                            'positions': 20 / 15,
                            'positions/{contract}': 20 / 15,
                            'position_close': 20 / 15,
                            'orders': 20 / 15,
                            'orders/{order_id}': 20 / 15,
                            'my_trades': 20 / 15,
                        },
                        'post': {
                            'orders': 20 / 15,
                        },
                        'delete': {
                            'orders': 20 / 15,
                            'orders/{order_id}': 20 / 15,
                        },
                    },
                    'earn': {
                        'get': {
                            'uni/lends': 20 / 15,
                            'uni/lend_records': 20 / 15,
                            'uni/interests/{currency}': 20 / 15,
                            'uni/interest_records': 20 / 15,
                        },
                        'post': {
                            'uni/lends': 20 / 15,
                        },
                        'put': {
                            'uni/interest_reinvest': 20 / 15,
                        },
                        'patch': {
                            'uni/lends': 20 / 15,
                        },
                    },
                    'loan': {
                        'get': {
                            'collateral/orders': 20 / 15,
                            'collateral/orders/{order_id}': 20 / 15,
                            'collateral/repay_records': 20 / 15,
                            'collateral/collaterals': 20 / 15,
                            'collateral/total_amount': 20 / 15,
                            'collateral/ltv': 20 / 15,
                            'collateral/currencies': 20 / 15,
                        },
                        'post': {
                            'collateral/orders': 20 / 15,
                            'collateral/repay': 20 / 15,
                            'collateral/collaterals': 20 / 15,
                        },
                    },
                    'account': {
                        'get': {
                            'detail': 20 / 15,
                            'stp_groups': 20 / 15,
                            'stp_groups/{stp_id}/users': 20 / 15,
                        },
                        'post': {
                            'stp_groups': 20 / 15,
                            'stp_groups/{stp_id}/users': 20 / 15,
                        },
                        'delete': {
                            'stp_groups/{stp_id}/users': 20 / 15,
                        },
                    },
                    'rebate': {
                        'get': {
                            'agency/transaction_history': 20 / 15,
                            'agency/commission_history': 20 / 15,
                        },
                    },
                },
            },
            'timeframes': {
                '10s': '10s',
                '1m': '1m',
                '5m': '5m',
                '15m': '15m',
                '30m': '30m',
                '1h': '1h',
                '4h': '4h',
                '8h': '8h',
                '1d': '1d',
                '7d': '7d',
                '1w': '7d',
            },
            // copied from gatev2
            'commonCurrencies': {
                '88MPH': 'MPH',
                'AXIS': 'Axis DeFi',
                'BIFI': 'Bitcoin File',
                'BOX': 'DefiBox',
                'BYN': 'BeyondFi',
                'EGG': 'Goose Finance',
                'GTC': 'Game.com', // conflict with Gitcoin and Gastrocoin
                'GTC_HT': 'Game.com HT',
                'GTC_BSC': 'Game.com BSC',
                'HIT': 'HitChain',
                'MM': 'Million', // conflict with MilliMeter
                'MPH': 'Morpher', // conflict with 88MPH
                'POINT': 'GatePoint',
                'RAI': 'Rai Reflex Index', // conflict with RAI Finance
                'SBTC': 'Super Bitcoin',
                'TNC': 'Trinity Network Credit',
                'VAI': 'VAIOT',
                'TRAC': 'TRACO', // conflict with OriginTrail (TRAC)
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': true,
            },
            'headers': {
                'X-Gate-Channel-Id': 'ccxt',
            },
            'options': {
                'sandboxMode': false,
                'createOrder': {
                    'expiration': 86400, // for conditional orders
                },
                'networks': {
                    'ALGORAND': 'ALGO',
                    'ARBITRUM_NOVA': 'ARBNOVA',
                    'ARBITRUM_ONE': 'ARBEVM',
                    'AVALANCHE_C': 'AVAX_C',
                    'BEP20': 'BSC',
                    'CHILIZ': 'CHZ',
                    'EOS': 'EOS',
                    'ERC20': 'ETH',
                    'GATECHAIN': 'GTEVM',
                    'HRC20': 'HT',
                    'KUSAMA': 'KSMSM',
                    'NEAR': 'NEAR',
                    'OKC': 'OKT',
                    'OPTIMISM': 'OPETH',
                    'POLKADOT': 'DOTSM',
                    'POLYGON': 'MATIC',
                    'SOLANA': 'SOL',
                    'TRC20': 'TRX',
                },
                'networksById': {
                    'ALGO': 'ALGORAND',
                    'ARBEVM': 'ARBITRUM_ONE',
                    'ARBNOVA': 'ARBITRUM_NOVA',
                    'AVAX_C': 'AVALANCHE_C',
                    'BSC': 'BEP20',
                    'CHZ': 'CHILIZ',
                    'DOTSM': 'POLKADOT',
                    'EOS': 'EOS',
                    'ETH': 'ERC20',
                    'GTEVM': 'GATECHAIN',
                    'HT': 'HRC20',
                    'KSMSM': 'KUSAMA',
                    'MATIC': 'POLYGON',
                    'NEAR': 'NEAR',
                    'OKT': 'OKC',
                    'OPETH': 'OPTIMISM',
                    'SOL': 'SOLANA',
                    'TRX': 'TRC20',
                },
                'timeInForce': {
                    'GTC': 'gtc',
                    'IOC': 'ioc',
                    'PO': 'poc',
                    'POC': 'poc',
                    'FOK': 'fok',
                },
                'accountsByType': {
                    'funding': 'spot',
                    'spot': 'spot',
                    'margin': 'margin',
                    'cross_margin': 'cross_margin',
                    'cross': 'cross_margin',
                    'isolated': 'margin',
                    'swap': 'futures',
                    'future': 'delivery',
                    'futures': 'futures',
                    'delivery': 'delivery',
                    'option': 'options',
                    'options': 'options',
                },
                'defaultType': 'spot',
                'swap': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'usdt', 'btc' ],
                    },
                },
                'future': {
                    'fetchMarkets': {
                        'settlementCurrencies': [ 'usdt' ],
                    },
                },
            },
            'precisionMode': TICK_SIZE,
            'fees': {
                'trading': {
                    'tierBased': true,
                    'feeSide': 'get',
                    'percentage': true,
                    'maker': this.parseNumber ('0.002'),
                    'taker': this.parseNumber ('0.002'),
                    'tiers': {
                        // volume is in BTC
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('1.5'), this.parseNumber ('0.00185') ],
                            [ this.parseNumber ('3'), this.parseNumber ('0.00175') ],
                            [ this.parseNumber ('6'), this.parseNumber ('0.00165') ],
                            [ this.parseNumber ('12.5'), this.parseNumber ('0.00155') ],
                            [ this.parseNumber ('25'), this.parseNumber ('0.00145') ],
                            [ this.parseNumber ('75'), this.parseNumber ('0.00135') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.00125') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.00115') ],
                            [ this.parseNumber ('1250'), this.parseNumber ('0.00105') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.00095') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('0.00085') ],
                            [ this.parseNumber ('6000'), this.parseNumber ('0.00075') ],
                            [ this.parseNumber ('11000'), this.parseNumber ('0.00065') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.00055') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('0.00055') ],
                            [ this.parseNumber ('75000'), this.parseNumber ('0.00055') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.002') ],
                            [ this.parseNumber ('1.5'), this.parseNumber ('0.00195') ],
                            [ this.parseNumber ('3'), this.parseNumber ('0.00185') ],
                            [ this.parseNumber ('6'), this.parseNumber ('0.00175') ],
                            [ this.parseNumber ('12.5'), this.parseNumber ('0.00165') ],
                            [ this.parseNumber ('25'), this.parseNumber ('0.00155') ],
                            [ this.parseNumber ('75'), this.parseNumber ('0.00145') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.00135') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.00125') ],
                            [ this.parseNumber ('1250'), this.parseNumber ('0.00115') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.00105') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('0.00095') ],
                            [ this.parseNumber ('6000'), this.parseNumber ('0.00085') ],
                            [ this.parseNumber ('11000'), this.parseNumber ('0.00075') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.00065') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('0.00065') ],
                            [ this.parseNumber ('75000'), this.parseNumber ('0.00065') ],
                        ],
                    },
                },
                'swap': {
                    'tierBased': true,
                    'feeSide': 'base',
                    'percentage': true,
                    'maker': this.parseNumber ('0.0'),
                    'taker': this.parseNumber ('0.0005'),
                    'tiers': {
                        'maker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.0000') ],
                            [ this.parseNumber ('1.5'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('3'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('6'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('12.5'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('25'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('75'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('200'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('500'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('1250'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('-0.00005') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('-0.00008') ],
                            [ this.parseNumber ('6000'), this.parseNumber ('-0.01000') ],
                            [ this.parseNumber ('11000'), this.parseNumber ('-0.01002') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('-0.01005') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('-0.02000') ],
                            [ this.parseNumber ('75000'), this.parseNumber ('-0.02005') ],
                        ],
                        'taker': [
                            [ this.parseNumber ('0'), this.parseNumber ('0.00050') ],
                            [ this.parseNumber ('1.5'), this.parseNumber ('0.00048') ],
                            [ this.parseNumber ('3'), this.parseNumber ('0.00046') ],
                            [ this.parseNumber ('6'), this.parseNumber ('0.00044') ],
                            [ this.parseNumber ('12.5'), this.parseNumber ('0.00042') ],
                            [ this.parseNumber ('25'), this.parseNumber ('0.00040') ],
                            [ this.parseNumber ('75'), this.parseNumber ('0.00038') ],
                            [ this.parseNumber ('200'), this.parseNumber ('0.00036') ],
                            [ this.parseNumber ('500'), this.parseNumber ('0.00034') ],
                            [ this.parseNumber ('1250'), this.parseNumber ('0.00032') ],
                            [ this.parseNumber ('2500'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('3000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('6000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('11000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('20000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('40000'), this.parseNumber ('0.00030') ],
                            [ this.parseNumber ('75000'), this.parseNumber ('0.00030') ],
                        ],
                    },
                },
            },
            // https://www.gate.io/docs/developers/apiv4/en/#label-list
            'exceptions': {
                'exact': {
                    'INVALID_PARAM_VALUE': BadRequest,
                    'INVALID_PROTOCOL': BadRequest,
                    'INVALID_ARGUMENT': BadRequest,
                    'INVALID_REQUEST_BODY': BadRequest,
                    'MISSING_REQUIRED_PARAM': ArgumentsRequired,
                    'BAD_REQUEST': BadRequest,
                    'INVALID_CONTENT_TYPE': BadRequest,
                    'NOT_ACCEPTABLE': BadRequest,
                    'METHOD_NOT_ALLOWED': BadRequest,
                    'NOT_FOUND': ExchangeError,
                    'INVALID_CREDENTIALS': AuthenticationError,
                    'INVALID_KEY': AuthenticationError,
                    'IP_FORBIDDEN': AuthenticationError,
                    'READ_ONLY': PermissionDenied,
                    'INVALID_SIGNATURE': AuthenticationError,
                    'MISSING_REQUIRED_HEADER': AuthenticationError,
                    'REQUEST_EXPIRED': AuthenticationError,
                    'ACCOUNT_LOCKED': AccountSuspended,
                    'FORBIDDEN': PermissionDenied,
                    'SUB_ACCOUNT_NOT_FOUND': ExchangeError,
                    'SUB_ACCOUNT_LOCKED': AccountSuspended,
                    'MARGIN_BALANCE_EXCEPTION': ExchangeError,
                    'MARGIN_TRANSFER_FAILED': ExchangeError,
                    'TOO_MUCH_FUTURES_AVAILABLE': ExchangeError,
                    'FUTURES_BALANCE_NOT_ENOUGH': InsufficientFunds,
                    'ACCOUNT_EXCEPTION': ExchangeError,
                    'SUB_ACCOUNT_TRANSFER_FAILED': ExchangeError,
                    'ADDRESS_NOT_USED': ExchangeError,
                    'TOO_FAST': RateLimitExceeded,
                    'WITHDRAWAL_OVER_LIMIT': ExchangeError,
                    'API_WITHDRAW_DISABLED': ExchangeNotAvailable,
                    'INVALID_WITHDRAW_ID': ExchangeError,
                    'INVALID_WITHDRAW_CANCEL_STATUS': ExchangeError,
                    'INVALID_PRECISION': InvalidOrder,
                    'INVALID_CURRENCY': BadSymbol,
                    'INVALID_CURRENCY_PAIR': BadSymbol,
                    'POC_FILL_IMMEDIATELY': OrderImmediatelyFillable, // {"label":"POC_FILL_IMMEDIATELY","message":"Order would match and take immediately so its cancelled"}
                    'ORDER_NOT_FOUND': OrderNotFound,
                    'CLIENT_ID_NOT_FOUND': OrderNotFound,
                    'ORDER_CLOSED': InvalidOrder,
                    'ORDER_CANCELLED': InvalidOrder,
                    'QUANTITY_NOT_ENOUGH': InvalidOrder,
                    'BALANCE_NOT_ENOUGH': InsufficientFunds,
                    'MARGIN_NOT_SUPPORTED': InvalidOrder,
                    'MARGIN_BALANCE_NOT_ENOUGH': InsufficientFunds,
                    'AMOUNT_TOO_LITTLE': InvalidOrder,
                    'AMOUNT_TOO_MUCH': InvalidOrder,
                    'REPEATED_CREATION': InvalidOrder,
                    'LOAN_NOT_FOUND': OrderNotFound,
                    'LOAN_RECORD_NOT_FOUND': OrderNotFound,
                    'NO_MATCHED_LOAN': ExchangeError,
                    'NOT_MERGEABLE': ExchangeError,
                    'NO_CHANGE': ExchangeError,
                    'REPAY_TOO_MUCH': ExchangeError,
                    'TOO_MANY_CURRENCY_PAIRS': InvalidOrder,
                    'TOO_MANY_ORDERS': InvalidOrder,
                    'TOO_MANY_REQUESTS': RateLimitExceeded,
                    'MIXED_ACCOUNT_TYPE': InvalidOrder,
                    'AUTO_BORROW_TOO_MUCH': ExchangeError,
                    'TRADE_RESTRICTED': InsufficientFunds,
                    'USER_NOT_FOUND': AccountNotEnabled,
                    'CONTRACT_NO_COUNTER': ExchangeError,
                    'CONTRACT_NOT_FOUND': BadSymbol,
                    'RISK_LIMIT_EXCEEDED': ExchangeError,
                    'INSUFFICIENT_AVAILABLE': InsufficientFunds,
                    'LIQUIDATE_IMMEDIATELY': InvalidOrder,
                    'LEVERAGE_TOO_HIGH': InvalidOrder,
                    'LEVERAGE_TOO_LOW': InvalidOrder,
                    'ORDER_NOT_OWNED': ExchangeError,
                    'ORDER_FINISHED': ExchangeError,
                    'POSITION_CROSS_MARGIN': ExchangeError,
                    'POSITION_IN_LIQUIDATION': ExchangeError,
                    'POSITION_IN_CLOSE': ExchangeError,
                    'POSITION_EMPTY': InvalidOrder,
                    'REMOVE_TOO_MUCH': ExchangeError,
                    'RISK_LIMIT_NOT_MULTIPLE': ExchangeError,
                    'RISK_LIMIT_TOO_HIGH': ExchangeError,
                    'RISK_LIMIT_TOO_lOW': ExchangeError,
                    'PRICE_TOO_DEVIATED': InvalidOrder,
                    'SIZE_TOO_LARGE': InvalidOrder,
                    'SIZE_TOO_SMALL': InvalidOrder,
                    'PRICE_OVER_LIQUIDATION': InvalidOrder,
                    'PRICE_OVER_BANKRUPT': InvalidOrder,
                    'ORDER_POC_IMMEDIATE': OrderImmediatelyFillable, // {"label":"ORDER_POC_IMMEDIATE","detail":"order price 1700 while counter price 1793.55"}
                    'INCREASE_POSITION': InvalidOrder,
                    'CONTRACT_IN_DELISTING': ExchangeError,
                    'INTERNAL': ExchangeNotAvailable,
                    'SERVER_ERROR': ExchangeNotAvailable,
                    'TOO_BUSY': ExchangeNotAvailable,
                    'CROSS_ACCOUNT_NOT_FOUND': ExchangeError,
                    'RISK_LIMIT_TOO_LOW': BadRequest, // {"label":"RISK_LIMIT_TOO_LOW","detail":"limit 1000000"}
                    'AUTO_TRIGGER_PRICE_LESS_LAST': InvalidOrder,  // {"label":"AUTO_TRIGGER_PRICE_LESS_LAST","message":"invalid argument: Trigger.Price must < last_price"}
                    'AUTO_TRIGGER_PRICE_GREATE_LAST': InvalidOrder, // {"label":"AUTO_TRIGGER_PRICE_GREATE_LAST","message":"invalid argument: Trigger.Price must > last_price"}
                    'POSITION_HOLDING': BadRequest,
                    'USER_LOAN_EXCEEDED': BadRequest, // {"label":"USER_LOAN_EXCEEDED","message":"Max loan amount per user would be exceeded"}
                },
                'broad': {},
            },
        });
    }

    setSandboxMode (enable) {
        super.setSandboxMode (enable);
        this.options['sandboxMode'] = enable;
    }

    convertExpireDate (date) {
        // parse YYMMDD to timestamp
        const year = date.slice (0, 2);
        const month = date.slice (2, 4);
        const day = date.slice (4, 6);
        const reconstructedDate = '20' + year + '-' + month + '-' + day + 'T00:00:00Z';
        return reconstructedDate;
    }

    createExpiredOptionMarket (symbol) {
        // support expired option contracts
        const quote = 'USDT';
        const settle = quote;
        const optionParts = symbol.split ('-');
        const symbolBase = symbol.split ('/');
        const marketIdBase = symbol.split ('_');
        let base = undefined;
        let expiry = this.safeString (optionParts, 1);
        if (symbol.indexOf ('/') > -1) {
            base = this.safeString (symbolBase, 0);
        } else {
            base = this.safeString (marketIdBase, 0);
            expiry = expiry.slice (2, 8); // convert 20230728 to 230728
        }
        const strike = this.safeString (optionParts, 2);
        const optionType = this.safeString (optionParts, 3);
        const datetime = this.convertExpireDate (expiry);
        const timestamp = this.parse8601 (datetime);
        return {
            'id': base + '_' + quote + '-' + '20' + expiry + '-' + strike + '-' + optionType,
            'symbol': base + '/' + quote + ':' + settle + '-' + expiry + '-' + strike + '-' + optionType,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': base,
            'quoteId': quote,
            'settleId': settle,
            'active': false,
            'type': 'option',
            'linear': undefined,
            'inverse': undefined,
            'spot': false,
            'swap': false,
            'future': false,
            'option': true,
            'margin': false,
            'contract': true,
            'contractSize': this.parseNumber ('1'),
            'expiry': timestamp,
            'expiryDatetime': datetime,
            'optionType': (optionType === 'C') ? 'call' : 'put',
            'strike': this.parseNumber (strike),
            'precision': {
                'amount': this.parseNumber ('1'),
                'price': undefined,
            },
            'limits': {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'info': undefined,
        } as MarketInterface;
    }

    market (symbol) {
        if (this.markets === undefined) {
            throw new ExchangeError (this.id + ' markets not loaded');
        }
        if (typeof symbol === 'string') {
            if (symbol in this.markets) {
                return this.markets[symbol];
            } else if (symbol in this.markets_by_id) {
                const markets = this.markets_by_id[symbol];
                const defaultType = this.safeString2 (this.options, 'defaultType', 'defaultSubType', 'spot');
                for (let i = 0; i < markets.length; i++) {
                    const market = markets[i];
                    if (market[defaultType]) {
                        return market;
                    }
                }
                return markets[0];
            } else if ((symbol.indexOf ('-C') > -1) || (symbol.indexOf ('-P') > -1)) {
                return this.createExpiredOptionMarket (symbol);
            }
        }
        throw new BadSymbol (this.id + ' does not have market symbol ' + symbol);
    }

    safeMarket (marketId = undefined, market = undefined, delimiter = undefined, marketType = undefined) {
        const isOption = (marketId !== undefined) && ((marketId.indexOf ('-C') > -1) || (marketId.indexOf ('-P') > -1));
        if (isOption && !(marketId in this.markets_by_id)) {
            // handle expired option contracts
            return this.createExpiredOptionMarket (marketId);
        }
        return super.safeMarket (marketId, market, delimiter, marketType);
    }

    async fetchMarkets (params = {}) {
        /**
         * @method
         * @name gate#fetchMarkets
         * @description retrieves data on all markets for gate
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-currency-pairs-supported                                     // spot
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-supported-currency-pairs-supported-in-margin-trading         // margin
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts                                            // swap
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts-2                                          // future
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-the-contracts-with-specified-underlying-and-expiration-time  // option
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} an array of objects representing market data
         */
        const sandboxMode = this.safeValue (this.options, 'sandboxMode', false);
        let rawPromises = [
            this.fetchContractMarkets (params),
            this.fetchOptionMarkets (params),
        ];
        if (!sandboxMode) {
            // gate does not have a sandbox for spot markets
            const mainnetOnly = [ this.fetchSpotMarkets (params) ];
            rawPromises = this.arrayConcat (rawPromises, mainnetOnly);
        }
        const promises = await Promise.all (rawPromises);
        const spotMarkets = this.safeValue (promises, 0, []);
        const contractMarkets = this.safeValue (promises, 1, []);
        const optionMarkets = this.safeValue (promises, 2, []);
        const markets = this.arrayConcat (spotMarkets, contractMarkets);
        return this.arrayConcat (markets, optionMarkets);
    }

    async fetchSpotMarkets (params = {}) {
        const marginResponse = await this.publicMarginGetCurrencyPairs (params);
        const spotMarketsResponse = await this.publicSpotGetCurrencyPairs (params);
        const marginMarkets = this.indexBy (marginResponse, 'id');
        //
        //  Spot
        //
        //     [
        //         {
        //             "id": "QTUM_ETH",
        //             "base": "QTUM",
        //             "quote": "ETH",
        //             "fee": "0.2",
        //             "min_base_amount": "0.01",
        //             "min_quote_amount": "0.001",
        //             "amount_precision": 3,
        //             "precision": 6,
        //             "trade_status": "tradable",
        //             "sell_start": 0,
        //             "buy_start": 0
        //         }
        //     ]
        //
        //  Margin
        //
        //     [
        //         {
        //             "id": "ETH_USDT",
        //             "base": "ETH",
        //             "quote": "USDT",
        //             "leverage": 3,
        //             "min_base_amount": "0.01",
        //             "min_quote_amount": "100",
        //             "max_quote_amount": "1000000"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < spotMarketsResponse.length; i++) {
            const spotMarket = spotMarketsResponse[i];
            const id = this.safeString (spotMarket, 'id');
            const marginMarket = this.safeValue (marginMarkets, id);
            const market = this.deepExtend (marginMarket, spotMarket);
            const [ baseId, quoteId ] = id.split ('_');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const takerPercent = this.safeString (market, 'fee');
            const makerPercent = this.safeString (market, 'maker_fee_rate', takerPercent);
            const amountPrecision = this.parseNumber (this.parsePrecision (this.safeString (market, 'amount_precision')));
            const tradeStatus = this.safeString (market, 'trade_status');
            const leverage = this.safeNumber (market, 'leverage');
            const margin = leverage !== undefined;
            result.push ({
                'id': id,
                'symbol': base + '/' + quote,
                'base': base,
                'quote': quote,
                'settle': undefined,
                'baseId': baseId,
                'quoteId': quoteId,
                'settleId': undefined,
                'type': 'spot',
                'spot': true,
                'margin': margin,
                'swap': false,
                'future': false,
                'option': false,
                'active': (tradeStatus === 'tradable'),
                'contract': false,
                'linear': undefined,
                'inverse': undefined,
                // Fee is in %, so divide by 100
                'taker': this.parseNumber (Precise.stringDiv (takerPercent, '100')),
                'maker': this.parseNumber (Precise.stringDiv (makerPercent, '100')),
                'contractSize': undefined,
                'expiry': undefined,
                'expiryDatetime': undefined,
                'strike': undefined,
                'optionType': undefined,
                'precision': {
                    'amount': amountPrecision,
                    'price': this.parseNumber (this.parsePrecision (this.safeString (market, 'precision'))),
                },
                'limits': {
                    'leverage': {
                        'min': this.parseNumber ('1'),
                        'max': this.safeNumber (market, 'leverage', 1),
                    },
                    'amount': {
                        'min': this.safeNumber (spotMarket, 'min_base_amount', amountPrecision),
                        'max': undefined,
                    },
                    'price': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'cost': {
                        'min': this.safeNumber (market, 'min_quote_amount'),
                        'max': margin ? this.safeNumber (market, 'max_quote_amount') : undefined,
                    },
                },
                'created': undefined,
                'info': market,
            });
        }
        return result;
    }

    async fetchContractMarkets (params = {}) {
        const result = [];
        const swapSettlementCurrencies = this.getSettlementCurrencies ('swap', 'fetchMarkets');
        const futureSettlementCurrencies = this.getSettlementCurrencies ('future', 'fetchMarkets');
        for (let c = 0; c < swapSettlementCurrencies.length; c++) {
            const settleId = swapSettlementCurrencies[c];
            const request = {
                'settle': settleId,
            };
            const response = await this.publicFuturesGetSettleContracts (this.extend (request, params));
            for (let i = 0; i < response.length; i++) {
                const parsedMarket = this.parseContractMarket (response[i], settleId);
                result.push (parsedMarket);
            }
        }
        for (let c = 0; c < futureSettlementCurrencies.length; c++) {
            const settleId = futureSettlementCurrencies[c];
            const request = {
                'settle': settleId,
            };
            const response = await this.publicDeliveryGetSettleContracts (this.extend (request, params));
            for (let i = 0; i < response.length; i++) {
                const parsedMarket = this.parseContractMarket (response[i], settleId);
                result.push (parsedMarket);
            }
        }
        return result;
    }

    parseContractMarket (market, settleId) {
        //
        //  Perpetual swap
        //
        //    {
        //        "name": "BTC_USDT",
        //        "type": "direct",
        //        "quanto_multiplier": "0.0001",
        //        "ref_discount_rate": "0",
        //        "order_price_deviate": "0.5",
        //        "maintenance_rate": "0.005",
        //        "mark_type": "index",
        //        "last_price": "38026",
        //        "mark_price": "37985.6",
        //        "index_price": "37954.92",
        //        "funding_rate_indicative": "0.000219",
        //        "mark_price_round": "0.01",
        //        "funding_offset": 0,
        //        "in_delisting": false,
        //        "risk_limit_base": "1000000",
        //        "interest_rate": "0.0003",
        //        "order_price_round": "0.1",
        //        "order_size_min": 1,
        //        "ref_rebate_rate": "0.2",
        //        "funding_interval": 28800,
        //        "risk_limit_step": "1000000",
        //        "leverage_min": "1",
        //        "leverage_max": "100",
        //        "risk_limit_max": "8000000",
        //        "maker_fee_rate": "-0.00025",
        //        "taker_fee_rate": "0.00075",
        //        "funding_rate": "0.002053",
        //        "order_size_max": 1000000,
        //        "funding_next_apply": 1610035200,
        //        "short_users": 977,
        //        "config_change_time": 1609899548,
        //        "trade_size": 28530850594,
        //        "position_size": 5223816,
        //        "long_users": 455,
        //        "funding_impact_value": "60000",
        //        "orders_limit": 50,
        //        "trade_id": 10851092,
        //        "orderbook_id": 2129638396
        //    }
        //
        //  Delivery Futures
        //
        //    {
        //        "name": "BTC_USDT_20200814",
        //        "underlying": "BTC_USDT",
        //        "cycle": "WEEKLY",
        //        "type": "direct",
        //        "quanto_multiplier": "0.0001",
        //        "mark_type": "index",
        //        "last_price": "9017",
        //        "mark_price": "9019",
        //        "index_price": "9005.3",
        //        "basis_rate": "0.185095",
        //        "basis_value": "13.7",
        //        "basis_impact_value": "100000",
        //        "settle_price": "0",
        //        "settle_price_interval": 60,
        //        "settle_price_duration": 1800,
        //        "settle_fee_rate": "0.0015",
        //        "expire_time": 1593763200,
        //        "order_price_round": "0.1",
        //        "mark_price_round": "0.1",
        //        "leverage_min": "1",
        //        "leverage_max": "100",
        //        "maintenance_rate": "1000000",
        //        "risk_limit_base": "140.726652109199",
        //        "risk_limit_step": "1000000",
        //        "risk_limit_max": "8000000",
        //        "maker_fee_rate": "-0.00025",
        //        "taker_fee_rate": "0.00075",
        //        "ref_discount_rate": "0",
        //        "ref_rebate_rate": "0.2",
        //        "order_price_deviate": "0.5",
        //        "order_size_min": 1,
        //        "order_size_max": 1000000,
        //        "orders_limit": 50,
        //        "orderbook_id": 63,
        //        "trade_id": 26,
        //        "trade_size": 435,
        //        "position_size": 130,
        //        "config_change_time": 1593158867,
        //        "in_delisting": false
        //    }
        //
        const id = this.safeString (market, 'name');
        const parts = id.split ('_');
        const baseId = this.safeString (parts, 0);
        const quoteId = this.safeString (parts, 1);
        const date = this.safeString (parts, 2);
        const base = this.safeCurrencyCode (baseId);
        const quote = this.safeCurrencyCode (quoteId);
        const settle = this.safeCurrencyCode (settleId);
        const expiry = this.safeTimestamp (market, 'expire_time');
        let symbol = '';
        let marketType = 'swap';
        if (date !== undefined) {
            symbol = base + '/' + quote + ':' + settle + '-' + this.yymmdd (expiry, '');
            marketType = 'future';
        } else {
            symbol = base + '/' + quote + ':' + settle;
        }
        const priceDeviate = this.safeString (market, 'order_price_deviate');
        const markPrice = this.safeString (market, 'mark_price');
        const minMultiplier = Precise.stringSub ('1', priceDeviate);
        const maxMultiplier = Precise.stringAdd ('1', priceDeviate);
        const minPrice = Precise.stringMul (minMultiplier, markPrice);
        const maxPrice = Precise.stringMul (maxMultiplier, markPrice);
        const takerPercent = this.safeString (market, 'taker_fee_rate');
        const makerPercent = this.safeString (market, 'maker_fee_rate', takerPercent);
        const isLinear = quote === settle;
        return {
            'id': id,
            'symbol': symbol,
            'base': base,
            'quote': quote,
            'settle': settle,
            'baseId': baseId,
            'quoteId': quoteId,
            'settleId': settleId,
            'type': marketType,
            'spot': false,
            'margin': false,
            'swap': marketType === 'swap',
            'future': marketType === 'future',
            'option': marketType === 'option',
            'active': true,
            'contract': true,
            'linear': isLinear,
            'inverse': !isLinear,
            'taker': this.parseNumber (Precise.stringDiv (takerPercent, '100')), // Fee is in %, so divide by 100
            'maker': this.parseNumber (Precise.stringDiv (makerPercent, '100')),
            'contractSize': this.safeNumber (market, 'quanto_multiplier'),
            'expiry': expiry,
            'expiryDatetime': this.iso8601 (expiry),
            'strike': undefined,
            'optionType': undefined,
            'precision': {
                'amount': this.parseNumber ('1'), // all contracts have this step size
                'price': this.safeNumber (market, 'order_price_round'),
            },
            'limits': {
                'leverage': {
                    'min': this.safeNumber (market, 'leverage_min'),
                    'max': this.safeNumber (market, 'leverage_max'),
                },
                'amount': {
                    'min': this.safeNumber (market, 'order_size_min'),
                    'max': this.safeNumber (market, 'order_size_max'),
                },
                'price': {
                    'min': this.parseNumber (minPrice),
                    'max': this.parseNumber (maxPrice),
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            },
            'created': undefined,
            'info': market,
        };
    }

    async fetchOptionMarkets (params = {}) {
        const result = [];
        const underlyings = await this.fetchOptionUnderlyings ();
        for (let i = 0; i < underlyings.length; i++) {
            const underlying = underlyings[i];
            const query = this.extend ({}, params);
            query['underlying'] = underlying;
            const response = await this.publicOptionsGetContracts (query);
            //
            //    [
            //        {
            //            "orders_limit": "50",
            //            "order_size_max": "100000",
            //            "mark_price_round": "0.1",
            //            "order_size_min": "1",
            //            "position_limit": "1000000",
            //            "orderbook_id": "575967",
            //            "order_price_deviate": "0.9",
            //            "is_call": true, // true means Call false means Put
            //            "last_price": "93.9",
            //            "bid1_size": "0",
            //            "bid1_price": "0",
            //            "taker_fee_rate": "0.0004",
            //            "underlying": "BTC_USDT",
            //            "create_time": "1646381188",
            //            "price_limit_fee_rate": "0.1",
            //            "maker_fee_rate": "0.0004",
            //            "trade_id": "727",
            //            "order_price_round": "0.1",
            //            "settle_fee_rate": "0.0001",
            //            "trade_size": "1982",
            //            "ref_rebate_rate": "0",
            //            "name": "BTC_USDT-20220311-44000-C",
            //            "underlying_price": "39194.26",
            //            "strike_price": "44000",
            //            "multiplier": "0.0001",
            //            "ask1_price": "0",
            //            "ref_discount_rate": "0",
            //            "expiration_time": "1646985600",
            //            "mark_price": "12.15",
            //            "position_size": "4",
            //            "ask1_size": "0",
            //            "tag": "WEEK"
            //        }
            //    ]
            //
            for (let j = 0; j < response.length; j++) {
                const market = response[j];
                const id = this.safeString (market, 'name');
                const parts = underlying.split ('_');
                const baseId = this.safeString (parts, 0);
                const quoteId = this.safeString (parts, 1);
                const base = this.safeCurrencyCode (baseId);
                const quote = this.safeCurrencyCode (quoteId);
                let symbol = base + '/' + quote;
                const expiry = this.safeTimestamp (market, 'expiration_time');
                const strike = this.safeString (market, 'strike_price');
                const isCall = this.safeValue (market, 'is_call');
                const optionLetter = isCall ? 'C' : 'P';
                const optionType = isCall ? 'call' : 'put';
                symbol = symbol + ':' + quote + '-' + this.yymmdd (expiry) + '-' + strike + '-' + optionLetter;
                const priceDeviate = this.safeString (market, 'order_price_deviate');
                const markPrice = this.safeString (market, 'mark_price');
                const minMultiplier = Precise.stringSub ('1', priceDeviate);
                const maxMultiplier = Precise.stringAdd ('1', priceDeviate);
                const minPrice = Precise.stringMul (minMultiplier, markPrice);
                const maxPrice = Precise.stringMul (maxMultiplier, markPrice);
                const takerPercent = this.safeString (market, 'taker_fee_rate');
                const makerPercent = this.safeString (market, 'maker_fee_rate', takerPercent);
                result.push ({
                    'id': id,
                    'symbol': symbol,
                    'base': base,
                    'quote': quote,
                    'settle': quote,
                    'baseId': baseId,
                    'quoteId': quoteId,
                    'settleId': quoteId,
                    'type': 'option',
                    'spot': false,
                    'margin': false,
                    'swap': false,
                    'future': false,
                    'option': true,
                    'active': true,
                    'contract': true,
                    'linear': true,
                    'inverse': false,
                    'taker': this.parseNumber (Precise.stringDiv (takerPercent, '100')), // Fee is in %, so divide by 100
                    'maker': this.parseNumber (Precise.stringDiv (makerPercent, '100')),
                    'contractSize': this.parseNumber ('1'),
                    'expiry': expiry,
                    'expiryDatetime': this.iso8601 (expiry),
                    'strike': strike,
                    'optionType': optionType,
                    'precision': {
                        'amount': this.parseNumber ('1'), // all options have this step size
                        'price': this.safeNumber (market, 'order_price_round'),
                    },
                    'limits': {
                        'leverage': {
                            'min': undefined,
                            'max': undefined,
                        },
                        'amount': {
                            'min': this.safeNumber (market, 'order_size_min'),
                            'max': this.safeNumber (market, 'order_size_max'),
                        },
                        'price': {
                            'min': this.parseNumber (minPrice),
                            'max': this.parseNumber (maxPrice),
                        },
                        'cost': {
                            'min': undefined,
                            'max': undefined,
                        },
                    },
                    'created': this.safeTimestamp (market, 'create_time'),
                    'info': market,
                });
            }
        }
        return result;
    }

    async fetchOptionUnderlyings () {
        const underlyingsResponse = await this.publicOptionsGetUnderlyings ();
        //
        //    [
        //        {
        //            "index_time": "1646915796",
        //            "name": "BTC_USDT",
        //            "index_price": "39142.73"
        //        }
        //    ]
        //
        const underlyings = [];
        for (let i = 0; i < underlyingsResponse.length; i++) {
            const underlying = underlyingsResponse[i];
            const name = this.safeString (underlying, 'name');
            if (name !== undefined) {
                underlyings.push (name);
            }
        }
        return underlyings;
    }

    prepareRequest (market = undefined, type = undefined, params = {}) {
        /**
         * @ignore
         * @method
         * @name gate#prepareRequest
         * @description Fills request params contract, settle, currency_pair, market and account where applicable
         * @param {object} market CCXT market, required when type is undefined
         * @param {string} type 'spot', 'swap', or 'future', required when market is undefined
         * @param {object} [params] request parameters
         * @returns the api request object, and the new params object with non-needed parameters removed
         */
        // * Do not call for multi spot order methods like cancelAllOrders and fetchOpenOrders. Use multiOrderSpotPrepareRequest instead
        const request = {};
        if (market !== undefined) {
            if (market['contract']) {
                request['contract'] = market['id'];
                if (!market['option']) {
                    request['settle'] = market['settleId'];
                }
            } else {
                request['currency_pair'] = market['id'];
            }
        } else {
            const swap = type === 'swap';
            const future = type === 'future';
            if (swap || future) {
                const defaultSettle = swap ? 'usdt' : 'btc';
                const settle = this.safeStringLower (params, 'settle', defaultSettle);
                params = this.omit (params, 'settle');
                request['settle'] = settle;
            }
        }
        return [ request, params ];
    }

    spotOrderPrepareRequest (market = undefined, stop = false, params = {}) {
        /**
         * @ignore
         * @method
         * @name gate#multiOrderSpotPrepareRequest
         * @description Fills request params currency_pair, market and account where applicable for spot order methods like fetchOpenOrders, cancelAllOrders
         * @param {object} market CCXT market
         * @param {bool} stop true if for a stop order
         * @param {object} [params] request parameters
         * @returns the api request object, and the new params object with non-needed parameters removed
         */
        const [ marginMode, query ] = this.getMarginMode (stop, params);
        const request = {};
        if (!stop) {
            if (market === undefined) {
                throw new ArgumentsRequired (this.id + ' spotOrderPrepareRequest() requires a market argument for non-stop orders');
            }
            request['account'] = marginMode;
            request['currency_pair'] = market['id']; // Should always be set for non-stop
        }
        return [ request, query ];
    }

    multiOrderSpotPrepareRequest (market = undefined, stop = false, params = {}) {
        /**
         * @ignore
         * @method
         * @name gate#multiOrderSpotPrepareRequest
         * @description Fills request params currency_pair, market and account where applicable for spot order methods like fetchOpenOrders, cancelAllOrders
         * @param {object} market CCXT market
         * @param {bool} stop true if for a stop order
         * @param {object} [params] request parameters
         * @returns the api request object, and the new params object with non-needed parameters removed
         */
        const [ marginMode, query ] = this.getMarginMode (stop, params);
        const request = {
            'account': marginMode,
        };
        if (market !== undefined) {
            if (stop) {
                // gate spot and margin stop orders use the term market instead of currency_pair, and normal instead of spot. Neither parameter is used when fetching/cancelling a single order. They are used for creating a single stop order, but createOrder does not call this method
                request['market'] = market['id'];
            } else {
                request['currency_pair'] = market['id'];
            }
        }
        return [ request, query ];
    }

    getMarginMode (stop, params) {
        /**
         * @ignore
         * @method
         * @name gate#getMarginMode
         * @description Gets the margin type for this api call
         * @param {bool} stop True if for a stop order
         * @param {object} [params] Request params
         * @returns The marginMode and the updated request params with marginMode removed, marginMode value is the value that can be read by the "account" property specified in gates api docs
         */
        const defaultMarginMode = this.safeStringLower2 (this.options, 'defaultMarginMode', 'marginMode', 'spot'); // 'margin' is isolated margin on gate's api
        let marginMode = this.safeStringLower2 (params, 'marginMode', 'account', defaultMarginMode);
        params = this.omit (params, [ 'marginMode', 'account' ]);
        if (marginMode === 'cross') {
            marginMode = 'cross_margin';
        } else if (marginMode === 'isolated') {
            marginMode = 'margin';
        } else if (marginMode === '') {
            marginMode = 'spot';
        }
        if (stop) {
            if (marginMode === 'spot') {
                // gate spot stop orders use the term normal instead of spot
                marginMode = 'normal';
            }
            if (marginMode === 'cross_margin') {
                throw new BadRequest (this.id + ' getMarginMode() does not support stop orders for cross margin');
            }
        }
        return [ marginMode, params ];
    }

    getSettlementCurrencies (type, method) {
        const options = this.safeValue (this.options, type, {}); // [ 'BTC', 'USDT' ] unified codes
        const fetchMarketsContractOptions = this.safeValue (options, method, {});
        const defaultSettle = (type === 'swap') ? [ 'usdt' ] : [ 'btc' ];
        return this.safeValue (fetchMarketsContractOptions, 'settlementCurrencies', defaultSettle);
    }

    async fetchCurrencies (params = {}) {
        /**
         * @method
         * @name gate#fetchCurrencies
         * @description fetches all available currencies on an exchange
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-currencies-details
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an associative dictionary of currencies
         */
        // sandbox/testnet only supports future markets
        const apiBackup = this.safeValue (this.urls, 'apiBackup');
        if (apiBackup !== undefined) {
            return undefined;
        }
        const response = await this.publicSpotGetCurrencies (params);
        //
        //    {
        //        "currency": "BCN",
        //        "delisted": false,
        //        "withdraw_disabled": true,
        //        "withdraw_delayed": false,
        //        "deposit_disabled": true,
        //        "trade_disabled": false
        //    }
        //
        //    {
        //        "currency":"USDT_ETH",
        //        "delisted":false,
        //        "withdraw_disabled":false,
        //        "withdraw_delayed":false,
        //        "deposit_disabled":false,
        //        "trade_disabled":false,
        //        "chain":"ETH"
        //    }
        //
        const result = {};
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const currencyId = this.safeString (entry, 'currency');
            const currencyIdLower = this.safeStringLower (entry, 'currency');
            const parts = currencyId.split ('_');
            const currency = parts[0];
            const code = this.safeCurrencyCode (currency);
            const networkId = this.safeString (entry, 'chain');
            const networkCode = this.networkIdToCode (networkId, code);
            const delisted = this.safeValue (entry, 'delisted');
            const withdrawDisabled = this.safeValue (entry, 'withdraw_disabled', false);
            const depositDisabled = this.safeValue (entry, 'deposit_disabled', false);
            const tradeDisabled = this.safeValue (entry, 'trade_disabled', false);
            const withdrawEnabled = !withdrawDisabled;
            const depositEnabled = !depositDisabled;
            const tradeEnabled = !tradeDisabled;
            const listed = !delisted;
            const active = listed && tradeEnabled && withdrawEnabled && depositEnabled;
            if (this.safeValue (result, code) === undefined) {
                result[code] = {
                    'id': code.toLowerCase (),
                    'code': code,
                    'info': undefined,
                    'name': undefined,
                    'active': active,
                    'deposit': depositEnabled,
                    'withdraw': withdrawEnabled,
                    'fee': undefined,
                    'fees': [],
                    'precision': this.parseNumber ('1e-4'),
                    'limits': this.limits,
                    'networks': {},
                };
            }
            let depositAvailable = this.safeValue (result[code], 'deposit');
            depositAvailable = (depositEnabled) ? depositEnabled : depositAvailable;
            let withdrawAvailable = this.safeValue (result[code], 'withdraw');
            withdrawAvailable = (withdrawEnabled) ? withdrawEnabled : withdrawAvailable;
            const networks = this.safeValue (result[code], 'networks', {});
            networks[networkCode] = {
                'info': entry,
                'id': networkId,
                'network': networkCode,
                'currencyId': currencyId,
                'lowerCaseCurrencyId': currencyIdLower,
                'deposit': depositEnabled,
                'withdraw': withdrawEnabled,
                'active': active,
                'fee': undefined,
                'precision': this.parseNumber ('1e-4'),
                'limits': {
                    'amount': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'withdraw': {
                        'min': undefined,
                        'max': undefined,
                    },
                    'deposit': {
                        'min': undefined,
                        'max': undefined,
                    },
                },
            };
            result[code]['networks'] = networks;
            const info = this.safeValue (result[code], 'info', []);
            info.push (entry);
            result[code]['info'] = info;
            result[code]['active'] = depositAvailable && withdrawAvailable;
            result[code]['deposit'] = depositAvailable;
            result[code]['withdraw'] = withdrawAvailable;
        }
        return result;
    }

    async fetchFundingRate (symbol: string, params = {}) {
        /**
         * @method
         * @name gate#fetchFundingRate
         * @description fetch the current funding rate
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-contract
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding rate structure]{@link https://docs.ccxt.com/#/?id=funding-rate-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRate() supports swap contracts only');
        }
        const [ request, query ] = this.prepareRequest (market, undefined, params);
        const response = await this.publicFuturesGetSettleContractsContract (this.extend (request, query));
        //
        //    [
        //        {
        //            "name": "BTC_USDT",
        //            "type": "direct",
        //            "quanto_multiplier": "0.0001",
        //            "ref_discount_rate": "0",
        //            "order_price_deviate": "0.5",
        //            "maintenance_rate": "0.005",
        //            "mark_type": "index",
        //            "last_price": "38026",
        //            "mark_price": "37985.6",
        //            "index_price": "37954.92",
        //            "funding_rate_indicative": "0.000219",
        //            "mark_price_round": "0.01",
        //            "funding_offset": 0,
        //            "in_delisting": false,
        //            "risk_limit_base": "1000000",
        //            "interest_rate": "0.0003",
        //            "order_price_round": "0.1",
        //            "order_size_min": 1,
        //            "ref_rebate_rate": "0.2",
        //            "funding_interval": 28800,
        //            "risk_limit_step": "1000000",
        //            "leverage_min": "1",
        //            "leverage_max": "100",
        //            "risk_limit_max": "8000000",
        //            "maker_fee_rate": "-0.00025",
        //            "taker_fee_rate": "0.00075",
        //            "funding_rate": "0.002053",
        //            "order_size_max": 1000000,
        //            "funding_next_apply": 1610035200,
        //            "short_users": 977,
        //            "config_change_time": 1609899548,
        //            "trade_size": 28530850594,
        //            "position_size": 5223816,
        //            "long_users": 455,
        //            "funding_impact_value": "60000",
        //            "orders_limit": 50,
        //            "trade_id": 10851092,
        //            "orderbook_id": 2129638396
        //        }
        //    ]
        //
        return this.parseFundingRate (response);
    }

    async fetchFundingRates (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchFundingRates
         * @description fetch the funding rate for multiple markets
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [funding rates structures]{@link https://docs.ccxt.com/#/?id=funding-rates-structure}, indexe by market symbols
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const [ request, query ] = this.prepareRequest (undefined, 'swap', params);
        const response = await this.publicFuturesGetSettleContracts (this.extend (request, query));
        //
        //    [
        //        {
        //            "name": "BTC_USDT",
        //            "type": "direct",
        //            "quanto_multiplier": "0.0001",
        //            "ref_discount_rate": "0",
        //            "order_price_deviate": "0.5",
        //            "maintenance_rate": "0.005",
        //            "mark_type": "index",
        //            "last_price": "38026",
        //            "mark_price": "37985.6",
        //            "index_price": "37954.92",
        //            "funding_rate_indicative": "0.000219",
        //            "mark_price_round": "0.01",
        //            "funding_offset": 0,
        //            "in_delisting": false,
        //            "risk_limit_base": "1000000",
        //            "interest_rate": "0.0003",
        //            "order_price_round": "0.1",
        //            "order_size_min": 1,
        //            "ref_rebate_rate": "0.2",
        //            "funding_interval": 28800,
        //            "risk_limit_step": "1000000",
        //            "leverage_min": "1",
        //            "leverage_max": "100",
        //            "risk_limit_max": "8000000",
        //            "maker_fee_rate": "-0.00025",
        //            "taker_fee_rate": "0.00075",
        //            "funding_rate": "0.002053",
        //            "order_size_max": 1000000,
        //            "funding_next_apply": 1610035200,
        //            "short_users": 977,
        //            "config_change_time": 1609899548,
        //            "trade_size": 28530850594,
        //            "position_size": 5223816,
        //            "long_users": 455,
        //            "funding_impact_value": "60000",
        //            "orders_limit": 50,
        //            "trade_id": 10851092,
        //            "orderbook_id": 2129638396
        //        }
        //    ]
        //
        const result = this.parseFundingRates (response);
        return this.filterByArray (result, 'symbol', symbols);
    }

    parseFundingRate (contract, market: Market = undefined) {
        //
        //    {
        //        "name": "BTC_USDT",
        //        "type": "direct",
        //        "quanto_multiplier": "0.0001",
        //        "ref_discount_rate": "0",
        //        "order_price_deviate": "0.5",
        //        "maintenance_rate": "0.005",
        //        "mark_type": "index",
        //        "last_price": "38026",
        //        "mark_price": "37985.6",
        //        "index_price": "37954.92",
        //        "funding_rate_indicative": "0.000219",
        //        "mark_price_round": "0.01",
        //        "funding_offset": 0,
        //        "in_delisting": false,
        //        "risk_limit_base": "1000000",
        //        "interest_rate": "0.0003",
        //        "order_price_round": "0.1",
        //        "order_size_min": 1,
        //        "ref_rebate_rate": "0.2",
        //        "funding_interval": 28800,
        //        "risk_limit_step": "1000000",
        //        "leverage_min": "1",
        //        "leverage_max": "100",
        //        "risk_limit_max": "8000000",
        //        "maker_fee_rate": "-0.00025",
        //        "taker_fee_rate": "0.00075",
        //        "funding_rate": "0.002053",
        //        "order_size_max": 1000000,
        //        "funding_next_apply": 1610035200,
        //        "short_users": 977,
        //        "config_change_time": 1609899548,
        //        "trade_size": 28530850594,
        //        "position_size": 5223816,
        //        "long_users": 455,
        //        "funding_impact_value": "60000",
        //        "orders_limit": 50,
        //        "trade_id": 10851092,
        //        "orderbook_id": 2129638396
        //    }
        //
        const marketId = this.safeString (contract, 'name');
        const symbol = this.safeSymbol (marketId, market, '_', 'swap');
        const markPrice = this.safeNumber (contract, 'mark_price');
        const indexPrice = this.safeNumber (contract, 'index_price');
        const interestRate = this.safeNumber (contract, 'interest_rate');
        const fundingRate = this.safeNumber (contract, 'funding_rate');
        const fundingTime = this.safeTimestamp (contract, 'funding_next_apply');
        const fundingRateIndicative = this.safeNumber (contract, 'funding_rate_indicative');
        return {
            'info': contract,
            'symbol': symbol,
            'markPrice': markPrice,
            'indexPrice': indexPrice,
            'interestRate': interestRate,
            'estimatedSettlePrice': undefined,
            'timestamp': undefined,
            'datetime': undefined,
            'fundingRate': fundingRate,
            'fundingTimestamp': fundingTime,
            'fundingDatetime': this.iso8601 (fundingTime),
            'nextFundingRate': fundingRateIndicative,
            'nextFundingTimestamp': undefined,
            'nextFundingDatetime': undefined,
            'previousFundingRate': undefined,
            'previousFundingTimestamp': undefined,
            'previousFundingDatetime': undefined,
        };
    }

    async fetchNetworkDepositAddress (code: string, params = {}) {
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateWalletGetDepositAddress (this.extend (request, params));
        const addresses = this.safeValue (response, 'multichain_addresses');
        const currencyId = this.safeString (response, 'currency');
        code = this.safeCurrencyCode (currencyId);
        const result = {};
        for (let i = 0; i < addresses.length; i++) {
            const entry = addresses[i];
            //
            //    {
            //        "chain": "ETH",
            //        "address": "0x359a697945E79C7e17b634675BD73B33324E9408",
            //        "payment_id": "",
            //        "payment_name": "",
            //        "obtain_failed": "0"
            //    }
            //
            const obtainFailed = this.safeInteger (entry, 'obtain_failed');
            if (obtainFailed) {
                continue;
            }
            const network = this.safeString (entry, 'chain');
            const address = this.safeString (entry, 'address');
            const tag = this.safeString (entry, 'payment_id');
            result[network] = {
                'info': entry,
                'code': code, // kept here for backward-compatibility, but will be removed soon
                'currency': code,
                'address': address,
                'tag': tag,
            };
        }
        return result;
    }

    async fetchDepositAddress (code: string, params = {}) {
        /**
         * @method
         * @name gate#fetchDepositAddress
         * @description fetch the deposit address for a currency associated with this account
         * @see https://www.gate.io/docs/developers/apiv4/en/#generate-currency-deposit-address
         * @param {string} code unified currency code
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [address structure]{@link https://docs.ccxt.com/#/?id=address-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
        };
        const response = await this.privateWalletGetDepositAddress (this.extend (request, params));
        //
        //    {
        //        "currency": "XRP",
        //        "address": "rHcFoo6a9qT5NHiVn1THQRhsEGcxtYCV4d 391331007",
        //        "multichain_addresses": [
        //            {
        //                "chain": "XRP",
        //                "address": "rHcFoo6a9qT5NHiVn1THQRhsEGcxtYCV4d",
        //                "payment_id": "391331007",
        //                "payment_name": "Tag",
        //                "obtain_failed": 0
        //            }
        //        ]
        //    }
        //
        const currencyId = this.safeString (response, 'currency');
        code = this.safeCurrencyCode (currencyId);
        const addressField = this.safeString (response, 'address');
        let tag = undefined;
        let address = undefined;
        if (addressField !== undefined) {
            if (addressField.indexOf ('New address is being generated for you, please wait') >= 0) {
                throw new BadResponse (this.id + ' ' + 'New address is being generated for you, please wait a few seconds and try again to get the address.');
            }
            if (addressField.indexOf (' ') >= 0) {
                const splitted = addressField.split (' ');
                address = splitted[0];
                tag = splitted[1];
            } else {
                address = addressField;
            }
        }
        this.checkAddress (address);
        return {
            'info': response,
            'code': code, // kept here for backward-compatibility, but will be removed soon
            'currency': code,
            'address': address,
            'tag': tag,
            'network': undefined,
        };
    }

    async fetchTradingFee (symbol: string, params = {}) {
        /**
         * @method
         * @name gate#fetchTradingFee
         * @description fetch the trading fees for a market
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-personal-trading-fee
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [fee structure]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'currency_pair': market['id'],
        };
        const response = await this.privateWalletGetFee (this.extend (request, params));
        //
        //    {
        //        "user_id": 1486602,
        //        "taker_fee": "0.002",
        //        "maker_fee": "0.002",
        //        "gt_discount": true,
        //        "gt_taker_fee": "0.0015",
        //        "gt_maker_fee": "0.0015",
        //        "loan_fee": "0.18",
        //        "point_type": "0",
        //        "futures_taker_fee": "0.0005",
        //        "futures_maker_fee": "0"
        //    }
        //
        return this.parseTradingFee (response, market);
    }

    async fetchTradingFees (params = {}) {
        /**
         * @method
         * @name gate#fetchTradingFees
         * @description fetch the trading fees for multiple markets
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-personal-trading-fee
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const response = await this.privateWalletGetFee (params);
        //
        //    {
        //        "user_id": 1486602,
        //        "taker_fee": "0.002",
        //        "maker_fee": "0.002",
        //        "gt_discount": true,
        //        "gt_taker_fee": "0.0015",
        //        "gt_maker_fee": "0.0015",
        //        "loan_fee": "0.18",
        //        "point_type": "0",
        //        "futures_taker_fee": "0.0005",
        //        "futures_maker_fee": "0"
        //    }
        //
        return this.parseTradingFees (response);
    }

    parseTradingFees (response) {
        const result = {};
        for (let i = 0; i < this.symbols.length; i++) {
            const symbol = this.symbols[i];
            const market = this.market (symbol);
            result[symbol] = this.parseTradingFee (response, market);
        }
        return result;
    }

    parseTradingFee (info, market: Market = undefined) {
        //
        //    {
        //        "user_id": 1486602,
        //        "taker_fee": "0.002",
        //        "maker_fee": "0.002",
        //        "gt_discount": true,
        //        "gt_taker_fee": "0.0015",
        //        "gt_maker_fee": "0.0015",
        //        "loan_fee": "0.18",
        //        "point_type": "0",
        //        "futures_taker_fee": "0.0005",
        //        "futures_maker_fee": "0"
        //    }
        //
        const gtDiscount = this.safeValue (info, 'gt_discount');
        const taker = gtDiscount ? 'gt_taker_fee' : 'taker_fee';
        const maker = gtDiscount ? 'gt_maker_fee' : 'maker_fee';
        const contract = this.safeValue (market, 'contract');
        const takerKey = contract ? 'futures_taker_fee' : taker;
        const makerKey = contract ? 'futures_maker_fee' : maker;
        return {
            'info': info,
            'symbol': this.safeString (market, 'symbol'),
            'maker': this.safeNumber (info, makerKey),
            'taker': this.safeNumber (info, takerKey),
        };
    }

    async fetchTransactionFees (codes = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchTransactionFees
         * @deprecated
         * @description please use fetchDepositWithdrawFees instead
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-withdrawal-status
         * @param {string[]|undefined} codes list of unified currency codes
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateWalletGetWithdrawStatus (params);
        //
        //    {
        //        "currency": "MTN",
        //        "name": "Medicalchain",
        //        "name_cn": "Medicalchain",
        //        "deposit": "0",
        //        "withdraw_percent": "0%",
        //        "withdraw_fix": "900",
        //        "withdraw_day_limit": "500000",
        //        "withdraw_day_limit_remain": "500000",
        //        "withdraw_amount_mini": "900.1",
        //        "withdraw_eachtime_limit": "90000000000",
        //        "withdraw_fix_on_chains": {
        //            "ETH": "900"
        //        }
        //    }
        //
        const result = {};
        let withdrawFees = {};
        for (let i = 0; i < response.length; i++) {
            withdrawFees = {};
            const entry = response[i];
            const currencyId = this.safeString (entry, 'currency');
            const code = this.safeCurrencyCode (currencyId);
            if ((codes !== undefined) && !this.inArray (code, codes)) {
                continue;
            }
            const withdrawFixOnChains = this.safeValue (entry, 'withdraw_fix_on_chains');
            if (withdrawFixOnChains === undefined) {
                withdrawFees = this.safeNumber (entry, 'withdraw_fix');
            } else {
                const chainKeys = Object.keys (withdrawFixOnChains);
                for (let j = 0; j < chainKeys.length; j++) {
                    const chainKey = chainKeys[j];
                    withdrawFees[chainKey] = this.parseNumber (withdrawFixOnChains[chainKey]);
                }
            }
            result[code] = {
                'withdraw': withdrawFees,
                'deposit': undefined,
                'info': entry,
            };
        }
        return result;
    }

    async fetchDepositWithdrawFees (codes: Strings = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchDepositWithdrawFees
         * @description fetch deposit and withdraw fees
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-withdrawal-status
         * @param {string[]|undefined} codes list of unified currency codes
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a list of [fee structures]{@link https://docs.ccxt.com/#/?id=fee-structure}
         */
        await this.loadMarkets ();
        const response = await this.privateWalletGetWithdrawStatus (params);
        //
        //    [
        //        {
        //            "currency": "MTN",
        //            "name": "Medicalchain",
        //            "name_cn": "Medicalchain",
        //            "deposit": "0",
        //            "withdraw_percent": "0%",
        //            "withdraw_fix": "900",
        //            "withdraw_day_limit": "500000",
        //            "withdraw_day_limit_remain": "500000",
        //            "withdraw_amount_mini": "900.1",
        //            "withdraw_eachtime_limit": "90000000000",
        //            "withdraw_fix_on_chains": {
        //                "ETH": "900"
        //            }
        //        }
        //    ]
        //
        return this.parseDepositWithdrawFees (response, codes, 'currency');
    }

    parseDepositWithdrawFee (fee, currency: Currency = undefined) {
        //
        //    {
        //        "currency": "MTN",
        //        "name": "Medicalchain",
        //        "name_cn": "Medicalchain",
        //        "deposit": "0",
        //        "withdraw_percent": "0%",
        //        "withdraw_fix": "900",
        //        "withdraw_day_limit": "500000",
        //        "withdraw_day_limit_remain": "500000",
        //        "withdraw_amount_mini": "900.1",
        //        "withdraw_eachtime_limit": "90000000000",
        //        "withdraw_fix_on_chains": {
        //            "ETH": "900"
        //        }
        //    }
        //
        const withdrawFixOnChains = this.safeValue (fee, 'withdraw_fix_on_chains');
        const result = {
            'info': fee,
            'withdraw': {
                'fee': this.safeNumber (fee, 'withdraw_fix'),
                'percentage': false,
            },
            'deposit': {
                'fee': this.safeNumber (fee, 'deposit'),
                'percentage': false,
            },
            'networks': {},
        };
        if (withdrawFixOnChains !== undefined) {
            const chainKeys = Object.keys (withdrawFixOnChains);
            for (let i = 0; i < chainKeys.length; i++) {
                const chainKey = chainKeys[i];
                result['networks'][chainKey] = {
                    'withdraw': {
                        'fee': this.parseNumber (withdrawFixOnChains[chainKey]),
                        'percentage': false,
                    },
                    'deposit': {
                        'fee': undefined,
                        'percentage': undefined,
                    },
                };
            }
        }
        return result;
    }

    async fetchFundingHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchFundingHistory
         * @description fetch the history of funding payments paid and received on this account
         * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book-3
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch funding history for
         * @param {int} [limit] the maximum number of funding history structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [funding history structure]{@link https://docs.ccxt.com/#/?id=funding-history-structure}
         */
        await this.loadMarkets ();
        // let defaultType = 'future';
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchFundingHistory', market, params);
        const [ request, requestParams ] = this.prepareRequest (market, type, query);
        request['type'] = 'fund';  // 'dnw' 'pnl' 'fee' 'refr' 'fund' 'point_dnw' 'point_fee' 'point_refr'
        if (since !== undefined) {
            request['from'] = since / 1000;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        let response = undefined;
        if (type === 'swap') {
            response = await this.privateFuturesGetSettleAccountBook (this.extend (request, requestParams));
        } else if (type === 'future') {
            response = await this.privateDeliveryGetSettleAccountBook (this.extend (request, requestParams));
        } else {
            throw new NotSupported (this.id + ' fetchFundingHistory() only support swap & future market type');
        }
        //
        //    [
        //        {
        //            "time": 1646899200,
        //            "change": "-0.027722",
        //            "balance": "11.653120591841",
        //            "text": "XRP_USDT",
        //            "type": "fund"
        //        },
        //        ...
        //    ]
        //
        return this.parseFundingHistories (response, symbol, since, limit);
    }

    parseFundingHistories (response, symbol, since, limit): FundingHistory[] {
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const funding = this.parseFundingHistory (entry);
            result.push (funding);
        }
        const sorted = this.sortBy (result, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    parseFundingHistory (info, market: Market = undefined) {
        //
        //    {
        //        "time": 1646899200,
        //        "change": "-0.027722",
        //        "balance": "11.653120591841",
        //        "text": "XRP_USDT",
        //        "type": "fund"
        //    }
        //
        const timestamp = this.safeTimestamp (info, 'time');
        const marketId = this.safeString (info, 'text');
        market = this.safeMarket (marketId, market, '_', 'swap');
        return {
            'info': info,
            'symbol': this.safeString (market, 'symbol'),
            'code': this.safeString (market, 'settle'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'id': undefined,
            'amount': this.safeNumber (info, 'change'),
        };
    }

    async fetchOrderBook (symbol: string, limit: Int = undefined, params = {}): Promise<OrderBook> {
        /**
         * @method
         * @name gate#fetchOrderBook
         * @description fetches information on open orders with bid (buy) and ask (sell) prices, volumes and other data
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-order-book
         * @see https://www.gate.io/docs/developers/apiv4/en/#futures-order-book
         * @see https://www.gate.io/docs/developers/apiv4/en/#futures-order-book-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#options-order-book
         * @param {string} symbol unified symbol of the market to fetch the order book for
         * @param {int} [limit] the maximum amount of order book entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} A dictionary of [order book structures]{@link https://docs.ccxt.com/#/?id=order-book-structure} indexed by market symbols
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        //
        //     const request = {
        //         'currency_pair': market['id'],
        //         'interval': '0', // depth, 0 means no aggregation is applied, default to 0
        //         'limit': limit, // maximum number of order depth data in asks or bids
        //         'with_id': true, // return order book ID
        //     };
        //
        const [ request, query ] = this.prepareRequest (market, market['type'], params);
        if (limit !== undefined) {
            request['limit'] = limit; // default 10, max 100
        }
        request['with_id'] = true;
        let response = undefined;
        if (market['spot'] || market['margin']) {
            response = await this.publicSpotGetOrderBook (this.extend (request, query));
        } else if (market['swap']) {
            response = await this.publicFuturesGetSettleOrderBook (this.extend (request, query));
        } else if (market['future']) {
            response = await this.publicDeliveryGetSettleOrderBook (this.extend (request, query));
        } else if (market['option']) {
            response = await this.publicOptionsGetOrderBook (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' fetchOrderBook() not support this market type');
        }
        //
        // spot
        //
        //     {
        //         "id": 6358770031
        //         "current": 1634345973275,
        //         "update": 1634345973271,
        //         "asks": [
        //             ["2.2241","12449.827"],
        //             ["2.2242","200"],
        //             ["2.2244","826.931"],
        //             ["2.2248","3876.107"],
        //             ["2.225","2377.252"],
        //             ["2.22509","439.484"],
        //             ["2.2251","1489.313"],
        //             ["2.2253","714.582"],
        //             ["2.2254","1349.784"],
        //             ["2.2256","234.701"]],
        //          "bids": [
        //             ["2.2236","32.465"],
        //             ["2.2232","243.983"],
        //             ["2.2231","32.207"],
        //             ["2.223","449.827"],
        //             ["2.2228","7.918"],
        //             ["2.2227","12703.482"],
        //             ["2.2226","143.033"],
        //             ["2.2225","143.027"],
        //             ["2.2224","1369.352"],
        //             ["2.2223","756.063"]
        //         ]
        //     }
        //
        // swap, future and option
        //
        //     {
        //         "id": 6358770031
        //         "current": 1634350208.745,
        //         "asks": [
        //             {"s": 24909, "p": "61264.8"},
        //             {"s": 81, "p": "61266.6"},
        //             {"s": 2000, "p": "61267.6"},
        //             {"s": 490, "p": "61270.2"},
        //             {"s": 12, "p": "61270.4"},
        //             {"s": 11782, "p": "61273.2"},
        //             {"s": 14666, "p": "61273.3"},
        //             {"s": 22541, "p": "61273.4"},
        //             {"s": 33, "p": "61273.6"},
        //             {"s": 11980, "p": "61274.5"}
        //         ],
        //         "bids": [
        //             {"s": 41844, "p": "61264.7"},
        //             {"s": 13783, "p": "61263.3"},
        //             {"s": 1143, "p": "61259.8"},
        //             {"s": 81, "p": "61258.7"},
        //             {"s": 2471, "p": "61257.8"},
        //             {"s": 2471, "p": "61257.7"},
        //             {"s": 2471, "p": "61256.5"},
        //             {"s": 3, "p": "61254.2"},
        //             {"s": 114, "p": "61252.4"},
        //             {"s": 14372, "p": "61248.6"}
        //         ],
        //         "update": 1634350208.724
        //     }
        //
        let timestamp = this.safeInteger (response, 'current');
        if (!market['spot']) {
            timestamp = timestamp * 1000;
        }
        const priceKey = market['spot'] ? 0 : 'p';
        const amountKey = market['spot'] ? 1 : 's';
        const nonce = this.safeInteger (response, 'id');
        const result = this.parseOrderBook (response, symbol, timestamp, 'bids', 'asks', priceKey, amountKey);
        result['nonce'] = nonce;
        return result;
    }

    async fetchTicker (symbol: string, params = {}): Promise<Ticker> {
        /**
         * @method
         * @name gate#fetchTicker
         * @description fetches a price ticker, a statistical calculation with the information calculated over the past 24 hours for a specific market
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-details-of-a-specifc-order
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-tickers-of-options-contracts
         * @param {string} symbol unified symbol of the market to fetch the ticker for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [ticker structure]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ request, query ] = this.prepareRequest (market, undefined, params);
        let response = undefined;
        if (market['spot'] || market['margin']) {
            response = await this.publicSpotGetTickers (this.extend (request, query));
        } else if (market['swap']) {
            response = await this.publicFuturesGetSettleTickers (this.extend (request, query));
        } else if (market['future']) {
            response = await this.publicDeliveryGetSettleTickers (this.extend (request, query));
        } else if (market['option']) {
            const marketId = market['id'];
            const optionParts = marketId.split ('-');
            request['underlying'] = this.safeString (optionParts, 0);
            response = await this.publicOptionsGetTickers (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' fetchTicker() not support this market type');
        }
        let ticker = undefined;
        if (market['option']) {
            for (let i = 0; i < response.length; i++) {
                const entry = response[i];
                if (entry['name'] === market['id']) {
                    ticker = entry;
                    break;
                }
            }
        } else {
            ticker = this.safeValue (response, 0);
        }
        return this.parseTicker (ticker, market);
    }

    parseTicker (ticker, market: Market = undefined): Ticker {
        //
        // SPOT
        //
        //     {
        //         "currency_pair": "KFC_USDT",
        //         "last": "7.255",
        //         "lowest_ask": "7.298",
        //         "highest_bid": "7.218",
        //         "change_percentage": "-1.18",
        //         "base_volume": "1219.053687865",
        //         "quote_volume": "8807.40299875455",
        //         "high_24h": "7.262",
        //         "low_24h": "7.095"
        //     }
        //
        // LINEAR/DELIVERY
        //
        //     {
        //         "contract": "BTC_USDT",
        //         "last": "6432",
        //         "low_24h": "6278",
        //         "high_24h": "6790",
        //         "change_percentage": "4.43",
        //         "total_size": "32323904",
        //         "volume_24h": "184040233284",
        //         "volume_24h_btc": "28613220",
        //         "volume_24h_usd": "184040233284",
        //         "volume_24h_base": "28613220",
        //         "volume_24h_quote": "184040233284",
        //         "volume_24h_settle": "28613220",
        //         "mark_price": "6534",
        //         "funding_rate": "0.0001",
        //         "funding_rate_indicative": "0.0001",
        //         "index_price": "6531"
        //     }
        //
        // bookTicker
        //    {
        //        "t": 1671363004228,
        //        "u": 9793320464,
        //        "s": "BTC_USDT",
        //        "b": "16716.8", // best bid price
        //        "B": "0.0134", // best bid size
        //        "a": "16716.9", // best ask price
        //        "A": "0.0353" // best ask size
        //     }
        //
        // option
        //
        //     {
        //         "vega": "0.00002",
        //         "leverage": "12.277188268663",
        //         "ask_iv": "0",
        //         "delta": "-0.99999",
        //         "last_price": "0",
        //         "theta": "-0.00661",
        //         "bid1_price": "1096",
        //         "mark_iv": "0.7799",
        //         "name": "BTC_USDT-20230608-28500-P",
        //         "bid_iv": "0",
        //         "ask1_price": "2935",
        //         "mark_price": "2147.3",
        //         "position_size": 0,
        //         "bid1_size": 12,
        //         "ask1_size": -14,
        //         "gamma": "0"
        //     }
        //
        const marketId = this.safeStringN (ticker, [ 'currency_pair', 'contract', 'name' ]);
        const marketType = ('mark_price' in ticker) ? 'contract' : 'spot';
        const symbol = this.safeSymbol (marketId, market, '_', marketType);
        const last = this.safeString2 (ticker, 'last', 'last_price');
        const ask = this.safeStringN (ticker, [ 'lowest_ask', 'a', 'ask1_price' ]);
        const bid = this.safeStringN (ticker, [ 'highest_bid', 'b', 'bid1_price' ]);
        const high = this.safeString (ticker, 'high_24h');
        const low = this.safeString (ticker, 'low_24h');
        const bidVolume = this.safeString2 (ticker, 'B', 'bid1_size');
        const askVolume = this.safeString2 (ticker, 'A', 'ask1_size');
        const timestamp = this.safeInteger (ticker, 't');
        let baseVolume = this.safeString2 (ticker, 'base_volume', 'volume_24h_base');
        if (baseVolume === 'nan') {
            baseVolume = '0';
        }
        let quoteVolume = this.safeString2 (ticker, 'quote_volume', 'volume_24h_quote');
        if (quoteVolume === 'nan') {
            quoteVolume = '0';
        }
        const percentage = this.safeString (ticker, 'change_percentage');
        return this.safeTicker ({
            'symbol': symbol,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'high': high,
            'low': low,
            'bid': bid,
            'bidVolume': bidVolume,
            'ask': ask,
            'askVolume': askVolume,
            'vwap': undefined,
            'open': undefined,
            'close': last,
            'last': last,
            'previousClose': undefined,
            'change': undefined,
            'percentage': percentage,
            'average': undefined,
            'baseVolume': baseVolume,
            'quoteVolume': quoteVolume,
            'info': ticker,
        }, market);
    }

    async fetchTickers (symbols: Strings = undefined, params = {}): Promise<Tickers> {
        /**
         * @method
         * @name gate#fetchTickers
         * @description fetches price tickers for multiple markets, statistical information calculated over the past 24 hours for each market
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-details-of-a-specifc-order
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-tickers-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-tickers-of-options-contracts
         * @param {string[]|undefined} symbols unified symbols of the markets to fetch the ticker for, all market tickers are returned if not assigned
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [ticker structures]{@link https://docs.ccxt.com/#/?id=ticker-structure}
         */
        await this.loadMarkets ();
        symbols = this.marketSymbols (symbols);
        const first = this.safeString (symbols, 0);
        let market = undefined;
        if (first !== undefined) {
            market = this.market (first);
        }
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchTickers', market, params);
        const [ request, requestParams ] = this.prepareRequest (undefined, type, query);
        let response = undefined;
        if (type === 'spot' || type === 'margin') {
            response = await this.publicSpotGetTickers (this.extend (request, requestParams));
        } else if (type === 'swap') {
            response = await this.publicFuturesGetSettleTickers (this.extend (request, requestParams));
        } else if (type === 'future') {
            response = await this.publicDeliveryGetSettleTickers (this.extend (request, requestParams));
        } else if (type === 'option') {
            this.checkRequiredArgument ('fetchTickers', symbols, 'symbols');
            const marketId = market['id'];
            const optionParts = marketId.split ('-');
            request['underlying'] = this.safeString (optionParts, 0);
            response = await this.publicOptionsGetTickers (this.extend (request, requestParams));
        } else {
            throw new NotSupported (this.id + ' fetchTickers() not support this market type');
        }
        return this.parseTickers (response, symbols);
    }

    parseBalanceHelper (entry) {
        const account = this.account ();
        account['used'] = this.safeString2 (entry, 'freeze', 'locked');
        account['free'] = this.safeString (entry, 'available');
        account['total'] = this.safeString (entry, 'total');
        if ('borrowed' in entry) {
            account['debt'] = this.safeString (entry, 'borrowed');
        }
        return account;
    }

    async fetchBalance (params = {}): Promise<Balances> {
        /**
         * @param {object} [params] exchange specific parameters
         * @param {string} [params.type] spot, margin, swap or future, if not provided this.options['defaultType'] is used
         * @param {string} [params.settle] 'btc' or 'usdt' - settle currency for perpetual swap and future - default="usdt" for swap and "btc" for future
         * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
         * @param {string} [params.symbol] margin only - unified ccxt symbol
         */
        await this.loadMarkets ();
        const symbol = this.safeString (params, 'symbol');
        params = this.omit (params, 'symbol');
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchBalance', undefined, params);
        const [ request, requestParams ] = this.prepareRequest (undefined, type, query);
        const [ marginMode, requestQuery ] = this.getMarginMode (false, requestParams);
        if (symbol !== undefined) {
            const market = this.market (symbol);
            request['currency_pair'] = market['id'];
        }
        let response = undefined;
        if (type === 'spot') {
            if (marginMode === 'spot') {
                response = await this.privateSpotGetAccounts (this.extend (request, requestQuery));
            } else if (marginMode === 'margin') {
                response = await this.privateMarginGetAccounts (this.extend (request, requestQuery));
            } else if (marginMode === 'cross_margin') {
                response = await this.privateMarginGetCrossAccounts (this.extend (request, requestQuery));
            } else {
                throw new NotSupported (this.id + ' fetchBalance() not support this marginMode');
            }
        } else if (type === 'funding') {
            response = await this.privateMarginGetFundingAccounts (this.extend (request, requestQuery));
        } else if (type === 'swap') {
            response = await this.privateFuturesGetSettleAccounts (this.extend (request, requestQuery));
        } else if (type === 'future') {
            response = await this.privateDeliveryGetSettleAccounts (this.extend (request, requestQuery));
        } else if (type === 'option') {
            response = await this.privateOptionsGetAccounts (this.extend (request, requestQuery));
        } else {
            throw new NotSupported (this.id + ' fetchBalance() not support this market type');
        }
        const contract = ((type === 'swap') || (type === 'future') || (type === 'option'));
        if (contract) {
            response = [ response ];
        }
        //
        // Spot / margin funding
        //
        //     [
        //         {
        //             "currency": "DBC",
        //             "available": "0",
        //             "locked": "0"
        //             "lent": "0", // margin funding only
        //             "total_lent": "0" // margin funding only
        //         },
        //         ...
        //     ]
        //
        //  Margin
        //
        //    [
        //        {
        //            "currency_pair": "DOGE_USDT",
        //            "locked": false,
        //            "risk": "9999.99",
        //            "base": {
        //                "currency": "DOGE",
        //                "available": "0",
        //                "locked": "0",
        //                "borrowed": "0",
        //                "interest": "0"
        //            },
        //            "quote": {
        //                "currency": "USDT",
        //                "available": "0.73402",
        //                "locked": "0",
        //                "borrowed": "0",
        //                "interest": "0"
        //            }
        //        },
        //        ...
        //    ]
        //
        // Cross margin
        //
        //    {
        //        "user_id": 10406147,
        //        "locked": false,
        //        "balances": {
        //            "USDT": {
        //                "available": "1",
        //                "freeze": "0",
        //                "borrowed": "0",
        //                "interest": "0"
        //            }
        //        },
        //        "total": "1",
        //        "borrowed": "0",
        //        "interest": "0",
        //        "risk": "9999.99"
        //    }
        //
        //  Perpetual Swap
        //
        //    {
        //        "order_margin": "0",
        //        "point": "0",
        //        "bonus": "0",
        //        "history": {
        //            "dnw": "2.1321",
        //            "pnl": "11.5351",
        //            "refr": "0",
        //            "point_fee": "0",
        //            "fund": "-0.32340576684",
        //            "bonus_dnw": "0",
        //            "point_refr": "0",
        //            "bonus_offset": "0",
        //            "fee": "-0.20132775",
        //            "point_dnw": "0",
        //        },
        //        "unrealised_pnl": "13.315100000006",
        //        "total": "12.51345151332",
        //        "available": "0",
        //        "in_dual_mode": false,
        //        "currency": "USDT",
        //        "position_margin": "12.51345151332",
        //        "user": "6333333",
        //    }
        //
        // Delivery Future
        //
        //    {
        //        "order_margin": "0",
        //        "point": "0",
        //        "history": {
        //            "dnw": "1",
        //            "pnl": "0",
        //            "refr": "0",
        //            "point_fee": "0",
        //            "point_dnw": "0",
        //            "settle": "0",
        //            "settle_fee": "0",
        //            "point_refr": "0",
        //            "fee": "0",
        //        },
        //        "unrealised_pnl": "0",
        //        "total": "1",
        //        "available": "1",
        //        "currency": "USDT",
        //        "position_margin": "0",
        //        "user": "6333333",
        //    }
        //
        // option
        //
        //     {
        //         "order_margin": "0",
        //         "bid_order_margin": "0",
        //         "init_margin": "0",
        //         "history": {
        //             "dnw": "32",
        //             "set": "0",
        //             "point_fee": "0",
        //             "point_dnw": "0",
        //             "prem": "0",
        //             "point_refr": "0",
        //             "insur": "0",
        //             "fee": "0",
        //             "refr": "0"
        //         },
        //         "total": "32",
        //         "available": "32",
        //         "liq_triggered": false,
        //         "maint_margin": "0",
        //         "ask_order_margin": "0",
        //         "point": "0",
        //         "position_notional_limit": "2000000",
        //         "unrealised_pnl": "0",
        //         "equity": "32",
        //         "user": 5691076,
        //         "currency": "USDT",
        //         "short_enabled": false,
        //         "orders_limit": 10
        //     }
        //
        const result = {
            'info': response,
        };
        const isolated = marginMode === 'margin';
        let data = response;
        if ('balances' in data) { // True for cross_margin
            const flatBalances = [];
            const balances = this.safeValue (data, 'balances', []);
            // inject currency and create an artificial balance object
            // so it can follow the existent flow
            const keys = Object.keys (balances);
            for (let i = 0; i < keys.length; i++) {
                const currencyId = keys[i];
                const content = balances[currencyId];
                content['currency'] = currencyId;
                flatBalances.push (content);
            }
            data = flatBalances;
        }
        for (let i = 0; i < data.length; i++) {
            const entry = data[i];
            if (isolated) {
                const marketId = this.safeString (entry, 'currency_pair');
                const symbolInner = this.safeSymbol (marketId, undefined, '_', 'margin');
                const base = this.safeValue (entry, 'base', {});
                const quote = this.safeValue (entry, 'quote', {});
                const baseCode = this.safeCurrencyCode (this.safeString (base, 'currency'));
                const quoteCode = this.safeCurrencyCode (this.safeString (quote, 'currency'));
                const subResult = {};
                subResult[baseCode] = this.parseBalanceHelper (base);
                subResult[quoteCode] = this.parseBalanceHelper (quote);
                result[symbolInner] = this.safeBalance (subResult);
            } else {
                const code = this.safeCurrencyCode (this.safeString (entry, 'currency'));
                result[code] = this.parseBalanceHelper (entry);
            }
        }
        const returnResult = isolated ? result : this.safeBalance (result);
        return returnResult as Balances;
    }

    async fetchOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}): Promise<OHLCV[]> {
        /**
         * @method
         * @name gateio#fetchOHLCV
         * @description fetches historical candlestick data containing the open, high, low, and close price, and the volume of a market
         * @see https://www.gate.io/docs/developers/apiv4/en/#market-candlesticks       // spot
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-futures-candlesticks  // swap
         * @see https://www.gate.io/docs/developers/apiv4/en/#market-candlesticks       // future
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-options-candlesticks  // option
         * @param {string} symbol unified symbol of the market to fetch OHLCV data for
         * @param {string} timeframe the length of time each candle represents
         * @param {int} [since] timestamp in ms of the earliest candle to fetch
         * @param {int} [limit] the maximum amount of candles to fetch, limit is conflicted with since and params["until"], If either since and params["until"] is specified, request will be rejected
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.price] "mark" or "index" for mark price and index price candles
         * @param {int} [params.until] timestamp in ms of the latest candle to fetch
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {int[][]} A list of candles ordered as timestamp, open, high, low, close, volume (units in quote currency)
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOHLCV', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOHLCV', symbol, since, limit, timeframe, params, 1000) as OHLCV[];
        }
        if (market['option']) {
            return await this.fetchOptionOHLCV (symbol, timeframe, since, limit, params);
        }
        const price = this.safeString (params, 'price');
        let request = {};
        [ request, params ] = this.prepareRequest (market, undefined, params);
        request['interval'] = this.safeString (this.timeframes, timeframe, timeframe);
        let maxLimit = 1000;
        limit = (limit === undefined) ? maxLimit : Math.min (limit, maxLimit);
        let until = this.safeInteger (params, 'until');
        if (until !== undefined) {
            until = this.parseToInt (until / 1000);
            params = this.omit (params, 'until');
        }
        if (since !== undefined) {
            const duration = this.parseTimeframe (timeframe);
            request['from'] = this.parseToInt (since / 1000);
            const distance = (limit - 1) * duration;
            const toTimestamp = this.sum (request['from'], distance);
            const currentTimestamp = this.seconds ();
            const to = Math.min (toTimestamp, currentTimestamp);
            if (until !== undefined) {
                request['to'] = Math.min (to, until);
            } else {
                request['to'] = to;
            }
        } else {
            if (until !== undefined) {
                request['to'] = until;
            }
            request['limit'] = limit;
        }
        let response = undefined;
        if (market['contract']) {
            maxLimit = 1999;
            const isMark = (price === 'mark');
            const isIndex = (price === 'index');
            if (isMark || isIndex) {
                request['contract'] = price + '_' + market['id'];
                params = this.omit (params, 'price');
            }
            if (market['future']) {
                response = await this.publicDeliveryGetSettleCandlesticks (this.extend (request, params));
            } else if (market['swap']) {
                response = await this.publicFuturesGetSettleCandlesticks (this.extend (request, params));
            }
        } else {
            response = await this.publicSpotGetCandlesticks (this.extend (request, params));
        }
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchOptionOHLCV (symbol: string, timeframe = '1m', since: Int = undefined, limit: Int = undefined, params = {}) {
        // separated option logic because the from, to and limit parameters weren't functioning
        await this.loadMarkets ();
        const market = this.market (symbol);
        let request = {};
        [ request, params ] = this.prepareRequest (market, undefined, params);
        request['interval'] = this.safeString (this.timeframes, timeframe, timeframe);
        const response = await this.publicOptionsGetCandlesticks (this.extend (request, params));
        return this.parseOHLCVs (response, market, timeframe, since, limit);
    }

    async fetchFundingRateHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchFundingRateHistory
         * @description fetches historical funding rate prices
         * @see https://www.gate.io/docs/developers/apiv4/en/#funding-rate-history
         * @param {string} symbol unified symbol of the market to fetch the funding rate history for
         * @param {int} [since] timestamp in ms of the earliest funding rate to fetch
         * @param {int} [limit] the maximum amount of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure} to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [funding rate structures]{@link https://docs.ccxt.com/#/?id=funding-rate-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchFundingRateHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadSymbol (this.id + ' fetchFundingRateHistory() supports swap contracts only');
        }
        const [ request, query ] = this.prepareRequest (market, undefined, params);
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicFuturesGetSettleFundingRate (this.extend (request, query));
        //
        //     {
        //         "r": "0.00063521",
        //         "t": "1621267200000",
        //     }
        //
        const rates = [];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const timestamp = this.safeTimestamp (entry, 't');
            rates.push ({
                'info': entry,
                'symbol': symbol,
                'fundingRate': this.safeNumber (entry, 'r'),
                'timestamp': timestamp,
                'datetime': this.iso8601 (timestamp),
            });
        }
        const sorted = this.sortBy (rates, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit) as FundingRateHistory[];
    }

    parseOHLCV (ohlcv, market: Market = undefined): OHLCV {
        //
        // Spot market candles
        //
        //    [
        //        "1660957920", // timestamp
        //        "6227.070147198573", // quote volume
        //        "0.0000133485", // close
        //        "0.0000133615", // high
        //        "0.0000133347", // low
        //        "0.0000133468", // open
        //        "466641934.99" // base volume
        //    ]
        //
        //
        // Swap, Future, Option, Mark and Index price candles
        //
        //     {
        //          "t":1632873600,         // Unix timestamp in seconds
        //          "o": "41025",           // Open price
        //          "h": "41882.17",        // Highest price
        //          "c": "41776.92",        // Close price
        //          "l": "40783.94"         // Lowest price
        //     }
        //
        if (Array.isArray (ohlcv)) {
            return [
                this.safeTimestamp (ohlcv, 0),   // unix timestamp in seconds
                this.safeNumber (ohlcv, 5),      // open price
                this.safeNumber (ohlcv, 3),      // highest price
                this.safeNumber (ohlcv, 4),      // lowest price
                this.safeNumber (ohlcv, 2),      // close price
                this.safeNumber (ohlcv, 6),      // trading volume
            ];
        } else {
            // Swap, Future, Option, Mark and Index price candles
            return [
                this.safeTimestamp (ohlcv, 't'), // unix timestamp in seconds
                this.safeNumber (ohlcv, 'o'),    // open price
                this.safeNumber (ohlcv, 'h'),    // highest price
                this.safeNumber (ohlcv, 'l'),    // lowest price
                this.safeNumber (ohlcv, 'c'),    // close price
                this.safeNumber (ohlcv, 'v'),    // trading volume, undefined for mark or index price
            ];
        }
    }

    async fetchTrades (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Trade[]> {
        /**
         * @method
         * @name gate#fetchTrades
         * @description get the list of most recent trades for a particular symbol
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-market-trades
         * @see https://www.gate.io/docs/developers/apiv4/en/#futures-trading-history
         * @see https://www.gate.io/docs/developers/apiv4/en/#futures-trading-history-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#options-trade-history
         * @param {string} symbol unified symbol of the market to fetch trades for
         * @param {int} [since] timestamp in ms of the earliest trade to fetch
         * @param {int} [limit] the maximum amount of trades to fetch
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest trade to fetch
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=public-trades}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchTrades', symbol, since, limit, params) as Trade[];
        }
        const market = this.market (symbol);
        //
        // spot
        //
        //     const request = {
        //         'currency_pair': market['id'],
        //         'limit': limit, // maximum number of records to be returned in a single list
        //         'last_id': 'id', // specify list staring point using the id of last record in previous list-query results
        //         'reverse': false, // true to retrieve records where id is smaller than the specified last_id, false to retrieve records where id is larger than the specified last_id
        //     };
        //
        // swap, future
        //
        //     const request = {
        //         'settle': market['settleId'],
        //         'contract': market['id'],
        //         'limit': limit, // maximum number of records to be returned in a single list
        //         'last_id': 'id', // specify list staring point using the id of last record in previous list-query results
        //         'from': since / 1000), // starting time in seconds, if not specified, to and limit will be used to limit response items
        //         'to': this.seconds (), // end time in seconds, default to current time
        //     };
        //
        const [ request, query ] = this.prepareRequest (market, undefined, params);
        const until = this.safeInteger2 (params, 'to', 'until');
        if (until !== undefined) {
            params = this.omit (params, [ 'until' ]);
            request['to'] = this.parseToInt (until / 1000);
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        if (since !== undefined && (market['contract'])) {
            request['from'] = this.parseToInt (since / 1000);
        }
        let response = undefined;
        if (market['type'] === 'spot' || market['type'] === 'margin') {
            response = await this.publicSpotGetTrades (this.extend (request, query));
        } else if (market['type'] === 'swap') {
            response = await this.publicFuturesGetSettleTrades (this.extend (request, query));
        } else if (market['type'] === 'future') {
            response = await this.publicDeliveryGetSettleTrades (this.extend (request, query));
        } else if (market['type'] === 'option') {
            response = await this.publicOptionsGetTrades (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' fetchTrades() not support this market type.');
        }
        //
        // spot
        //
        //     [
        //         {
        //             "id": "1852958144",
        //             "create_time": "1634673259",
        //             "create_time_ms": "1634673259378.105000",
        //             "currency_pair": "ADA_USDT",
        //             "side": "sell",
        //             "amount": "307.078",
        //             "price": "2.104",
        //         }
        //     ]
        //
        // perpetual swap
        //
        //     [
        //         {
        //              "size": "2",
        //              "id": "2522911",
        //              "create_time_ms": "1634673380.182",
        //              "create_time": "1634673380.182",
        //              "contract": "ADA_USDT",
        //              "price": "2.10486",
        //         }
        //     ]
        //
        // option
        //
        //     [
        //         {
        //             "size": -5,
        //             "id": 25,
        //             "create_time": 1682378573,
        //             "contract": "ETH_USDT-20230526-2000-P",
        //             "price": "209.1"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    async fetchOrderTrades (id: string, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchOrderTrades
         * @description fetch all the trades made from a single order
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-3
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-4
         * @param {string} id order id
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchOrderTrades() requires a symbol argument');
        }
        await this.loadMarkets ();
        //
        //      [
        //          {
        //              "id":"3711449544",
        //              "create_time":"1655486040",
        //              "create_time_ms":"1655486040177.599900",
        //              "currency_pair":"SHIB_USDT",
        //              "side":"buy",
        //              "role":"taker",
        //              "amount":"1360039",
        //              "price":"0.0000081084",
        //              "order_id":"169717399644",
        //              "fee":"2720.078",
        //              "fee_currency":"SHIB",
        //              "point_fee":"0",
        //              "gt_fee":"0"
        //          }
        //      ]
        //
        const response = await this.fetchMyTrades (symbol, since, limit, { 'order_id': id });
        return response;
    }

    async fetchMyTrades (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchMyTrades
         * @description Fetch personal trading history
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-3
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-personal-trading-history-4
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch trades for
         * @param {int} [limit] the maximum number of trades structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
         * @param {string} [params.type] 'spot', 'swap', or 'future', if not provided this.options['defaultMarginMode'] is used
         * @param {int} [params.until] The latest timestamp, in ms, that fetched trades were made
         * @param {int} [params.page] *spot only* Page number
         * @param {string} [params.order_id] *spot only* Filter trades with specified order ID. symbol is also required if this field is present
         * @param {string} [params.order] *contract only* Futures order ID, return related data only if specified
         * @param {int} [params.offset] *contract only* list offset, starting from 0
         * @param {string} [params.last_id] *contract only* specify list staring point using the id of last record in previous list-query results
         * @param {int} [params.count_total] *contract only* whether to return total number matched, default to 0(no return)
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {Trade[]} a list of [trade structures]{@link https://docs.ccxt.com/#/?id=trade-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchMyTrades', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchMyTrades', symbol, since, limit, params) as Trade[];
        }
        let type = undefined;
        let marginMode = undefined;
        let request = {};
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const until = this.safeInteger2 (params, 'until', 'till');
        params = this.omit (params, [ 'until', 'till' ]);
        [ type, params ] = this.handleMarketTypeAndParams ('fetchMyTrades', market, params);
        const contract = (type === 'swap') || (type === 'future') || (type === 'option');
        if (contract) {
            [ request, params ] = this.prepareRequest (market, type, params);
            if (type === 'option') {
                params = this.omit (params, 'order_id');
            }
        } else {
            if (market !== undefined) {
                request['currency_pair'] = market['id']; // Should always be set for non-stop
            }
            [ marginMode, params ] = this.getMarginMode (false, params);
            request['account'] = marginMode;
        }
        if (limit !== undefined) {
            request['limit'] = limit; // default 100, max 1000
        }
        if (since !== undefined) {
            request['from'] = this.parseToInt (since / 1000);
        }
        if (until !== undefined) {
            request['to'] = this.parseToInt (until / 1000);
        }
        let response = undefined;
        if (type === 'spot' || type === 'margin') {
            response = await this.privateSpotGetMyTrades (this.extend (request, params));
        } else if (type === 'swap') {
            response = await this.privateFuturesGetSettleMyTradesTimerange (this.extend (request, params));
        } else if (type === 'future') {
            response = await this.privateDeliveryGetSettleMyTrades (this.extend (request, params));
        } else if (type === 'option') {
            response = await this.privateOptionsGetMyTrades (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchMyTrades() not support this market type.');
        }
        //
        // spot
        //
        //     [
        //         {
        //             "id": "2876130500",
        //             "create_time": "1645464610",
        //             "create_time_ms": "1645464610777.399200",
        //             "currency_pair": "DOGE_USDT",
        //             "side": "sell",
        //             "role": "taker",
        //             "amount": "10.97",
        //             "price": "0.137384",
        //             "order_id": "125924049993",
        //             "fee": "0.00301420496",
        //             "fee_currency": "USDT",
        //             "point_fee": "0",
        //             "gt_fee": "0"
        //         }
        //     ]
        //
        // perpetual swap
        //
        //     [
        //         {
        //             "size": -5,
        //             "order_id": "130264979823",
        //             "id": 26884791,
        //             "role": "taker",
        //             "create_time": 1645465199.5472,
        //             "contract": "DOGE_USDT",
        //             "price": "0.136888"
        //         }
        //     ]
        //
        // future
        //
        //     [
        //         {
        //             "id": 121234231,
        //             "create_time": 1514764800.123,
        //             "contract": "BTC_USDT",
        //             "order_id": "21893289839",
        //             "size": 100,
        //             "price": "100.123",
        //             "role": "taker"
        //         }
        //     ]
        //
        // option
        //
        //     [
        //         {
        //             "underlying_price": "26817.84",
        //             "size": -1,
        //             "contract": "BTC_USDT-20230602-26500-C",
        //             "id": 16,
        //             "role": "taker",
        //             "create_time": 1685594770,
        //             "order_id": 2611026125,
        //             "price": "333"
        //         }
        //     ]
        //
        return this.parseTrades (response, market, since, limit);
    }

    parseTrade (trade, market: Market = undefined): Trade {
        //
        // public
        //
        //     {
        //         "id": "1334253759",
        //         "create_time": "1626342738",
        //         "create_time_ms": "1626342738331.497000",
        //         "currency_pair": "BTC_USDT",
        //         "side": "sell",
        //         "amount": "0.0022",
        //         "price": "32452.16"
        //     }
        //
        // public ws
        //
        //     {
        //         "id": 221994511,
        //         "time": 1580311438.618647,
        //         "price": "9309",
        //         "amount": "0.0019",
        //         "type": "sell"
        //     }
        //
        // spot rest
        //
        //     {
        //         "id": "2876130500",
        //         "create_time": "1645464610",
        //         "create_time_ms": "1645464610777.399200",
        //         "currency_pair": "DOGE_USDT",
        //         "side": "sell",
        //         "role": "taker",
        //         "amount": "10.97",
        //         "price": "0.137384",
        //         "order_id": "125924049993",
        //         "fee": "0.00301420496",
        //         "fee_currency": "USDT",
        //         "point_fee": "1.1",
        //         "gt_fee":"2.2"
        //     }
        //
        // perpetual swap rest
        //
        //     {
        //         "size": -5,
        //         "order_id": "130264979823",
        //         "id": 26884791,
        //         "role": "taker",
        //         "create_time": 1645465199.5472,
        //         "contract": "DOGE_USDT",
        //         "price": "0.136888"
        //     }
        //
        // future rest
        //
        //     {
        //         "id": 121234231,
        //         "create_time": 1514764800.123,
        //         "contract": "BTC_USDT",
        //         "order_id": "21893289839",
        //         "size": 100,
        //         "price": "100.123",
        //         "role": "taker"
        //     }
        //
        // fetchTrades: option
        //
        //     {
        //         "size": -5,
        //         "id": 25,
        //         "create_time": 1682378573,
        //         "contract": "ETH_USDT-20230526-2000-P",
        //         "price": "209.1"
        //     }
        //
        // fetchMyTrades: option
        //
        //     {
        //         "underlying_price": "26817.84",
        //         "size": -1,
        //         "contract": "BTC_USDT-20230602-26500-C",
        //         "id": 16,
        //         "role": "taker",
        //         "create_time": 1685594770,
        //         "order_id": 2611026125,
        //         "price": "333"
        //     }
        //
        const id = this.safeString (trade, 'id');
        let timestamp = this.safeTimestamp2 (trade, 'time', 'create_time');
        timestamp = this.safeInteger (trade, 'create_time_ms', timestamp);
        const marketId = this.safeString2 (trade, 'currency_pair', 'contract');
        const marketType = ('contract' in trade) ? 'contract' : 'spot';
        market = this.safeMarket (marketId, market, '_', marketType);
        let amountString = this.safeString2 (trade, 'amount', 'size');
        const priceString = this.safeString (trade, 'price');
        const contractSide = Precise.stringLt (amountString, '0') ? 'sell' : 'buy';
        amountString = Precise.stringAbs (amountString);
        const side = this.safeString2 (trade, 'side', 'type', contractSide);
        const orderId = this.safeString (trade, 'order_id');
        const feeAmount = this.safeString (trade, 'fee');
        const gtFee = this.safeString (trade, 'gt_fee');
        const pointFee = this.safeString (trade, 'point_fee');
        const fees = [];
        if (feeAmount !== undefined) {
            const feeCurrencyId = this.safeString (trade, 'fee_currency');
            let feeCurrencyCode = this.safeCurrencyCode (feeCurrencyId);
            if (feeCurrencyCode === undefined) {
                feeCurrencyCode = this.safeString (market, 'settle');
            }
            fees.push ({
                'cost': feeAmount,
                'currency': feeCurrencyCode,
            });
        }
        if (gtFee !== undefined) {
            fees.push ({
                'cost': gtFee,
                'currency': 'GT',
            });
        }
        if (pointFee !== undefined) {
            fees.push ({
                'cost': pointFee,
                'currency': 'GatePoint',
            });
        }
        const takerOrMaker = this.safeString (trade, 'role');
        return this.safeTrade ({
            'info': trade,
            'id': id,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'order': orderId,
            'type': undefined,
            'side': side,
            'takerOrMaker': takerOrMaker,
            'price': priceString,
            'amount': amountString,
            'cost': undefined,
            'fee': undefined,
            'fees': fees,
        }, market);
    }

    async fetchDeposits (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name gate#fetchDeposits
         * @description fetch all deposits made to an account
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-deposit-records
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch deposits for
         * @param {int} [limit] the maximum number of deposits structures to retrieve
         * @param {int} [params.until] end time in ms
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchDeposits', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchDeposits', code, since, limit, params);
        }
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            const start = this.parseToInt (since / 1000);
            request['from'] = start;
            request['to'] = this.sum (start, 30 * 24 * 60 * 60);
        }
        [ request, params ] = this.handleUntilOption ('to', request, params);
        const response = await this.privateWalletGetDeposits (this.extend (request, params));
        return this.parseTransactions (response, currency);
    }

    async fetchWithdrawals (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Transaction[]> {
        /**
         * @method
         * @name gate#fetchWithdrawals
         * @description fetch all withdrawals made from an account
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-withdrawal-records
         * @param {string} code unified currency code
         * @param {int} [since] the earliest time in ms to fetch withdrawals for
         * @param {int} [limit] the maximum number of withdrawals structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] end time in ms
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object[]} a list of [transaction structures]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchWithdrawals', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchWithdrawals', code, since, limit, params);
        }
        let request = {};
        let currency = undefined;
        if (code !== undefined) {
            currency = this.currency (code);
            request['currency'] = currency['id'];
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            const start = this.parseToInt (since / 1000);
            request['from'] = start;
            request['to'] = this.sum (start, 30 * 24 * 60 * 60);
        }
        [ request, params ] = this.handleUntilOption ('to', request, params);
        const response = await this.privateWalletGetWithdrawals (this.extend (request, params));
        return this.parseTransactions (response, currency);
    }

    async withdraw (code: string, amount, address, tag = undefined, params = {}) {
        /**
         * @method
         * @name gate#withdraw
         * @description make a withdrawal
         * @see https://www.gate.io/docs/developers/apiv4/en/#withdraw
         * @param {string} code unified currency code
         * @param {float} amount the amount to withdraw
         * @param {string} address the address to withdraw to
         * @param {string} tag
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [transaction structure]{@link https://docs.ccxt.com/#/?id=transaction-structure}
         */
        [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
        this.checkAddress (address);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'],
            'address': address,
            'amount': this.currencyToPrecision (code, amount),
        };
        if (tag !== undefined) {
            request['memo'] = tag;
        }
        const networks = this.safeValue (this.options, 'networks', {});
        let network = this.safeStringUpper (params, 'network'); // this line allows the user to specify either ERC20 or ETH
        network = this.safeStringLower (networks, network, network); // handle ETH>ERC20 alias
        if (network !== undefined) {
            request['chain'] = network;
            params = this.omit (params, 'network');
        } else {
            request['chain'] = currency['id'];
        }
        const response = await this.privateWithdrawalsPostWithdrawals (this.extend (request, params));
        //
        //    {
        //        "id": "w13389675",
        //        "currency": "USDT",
        //        "amount": "50",
        //        "address": "TUu2rLFrmzUodiWfYki7QCNtv1akL682p1",
        //        "memo": null
        //    }
        //
        return this.parseTransaction (response, currency);
    }

    parseTransactionStatus (status) {
        const statuses = {
            'PEND': 'pending',
            'REQUEST': 'pending',
            'DMOVE': 'pending',
            'CANCEL': 'failed',
            'DONE': 'ok',
            'BCODE': 'ok', // GateCode withdrawal
        };
        return this.safeString (statuses, status, status);
    }

    parseTransactionType (type) {
        const types = {
            'd': 'deposit',
            'w': 'withdrawal',
        };
        return this.safeString (types, type, type);
    }

    parseTransaction (transaction, currency: Currency = undefined): Transaction {
        //
        // deposits
        //
        //    {
        //        "id": "d33361395",
        //        "currency": "USDT_TRX",
        //        "address": "TErdnxenuLtXfnMafLbfappYdHtnXQ5U4z",
        //        "amount": "100",
        //        "txid": "ae9374de34e558562fe18cbb1bf9ab4d9eb8aa7669d65541c9fa2a532c1474a0",
        //        "timestamp": "1626345819",
        //        "status": "DONE",
        //        "memo": ""
        //    }
        //
        // withdraw
        //
        //    {
        //        "id": "w13389675",
        //        "currency": "USDT",
        //        "amount": "50",
        //        "address": "TUu2rLFrmzUodiWfYki7QCNtv1akL682p1",
        //        "memo": null
        //    }
        //
        //     {
        //         "currency":"usdt",
        //         "address":"0x01b0A9b7b4CdE774AF0f3E47CB4f1c2CCdBa0806",
        //         "amount":"1880",
        //         "chain":"eth"
        //     }
        //
        const id = this.safeString (transaction, 'id');
        let type = undefined;
        let amountString = this.safeString (transaction, 'amount');
        if (id !== undefined) {
            if (id[0] === 'b') {
                // GateCode handling
                type = Precise.stringGt (amountString, '0') ? 'deposit' : 'withdrawal';
                amountString = Precise.stringAbs (amountString);
            } else {
                type = this.parseTransactionType (id[0]);
            }
        }
        const feeCostString = this.safeString (transaction, 'fee');
        if (type === 'withdrawal') {
            amountString = Precise.stringSub (amountString, feeCostString);
        }
        const networkId = this.safeStringUpper (transaction, 'chain');
        const currencyId = this.safeString (transaction, 'currency');
        const code = this.safeCurrencyCode (currencyId);
        const txid = this.safeString (transaction, 'txid');
        const rawStatus = this.safeString (transaction, 'status');
        const status = this.parseTransactionStatus (rawStatus);
        const address = this.safeString (transaction, 'address');
        const tag = this.safeString (transaction, 'memo');
        const timestamp = this.safeTimestamp (transaction, 'timestamp');
        return {
            'info': transaction,
            'id': id,
            'txid': txid,
            'currency': code,
            'amount': this.parseNumber (amountString),
            'network': this.networkIdToCode (networkId),
            'address': address,
            'addressTo': undefined,
            'addressFrom': undefined,
            'tag': tag,
            'tagTo': undefined,
            'tagFrom': undefined,
            'status': status,
            'type': type,
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'updated': undefined,
            'internal': undefined,
            'comment': undefined,
            'fee': {
                'currency': code,
                'cost': this.parseNumber (feeCostString),
            },
        };
    }

    async createOrder (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        /**
         * @method
         * @name gate#createOrder
         * @description Create an order on the exchange
         * @see https://www.gate.io/docs/developers/apiv4/en/#create-an-order
         * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-price-triggered-order
         * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order
         * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-price-triggered-order-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-futures-order-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-price-triggered-order-3
         * @see https://www.gate.io/docs/developers/apiv4/en/#create-an-options-order
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} type 'limit' or 'market' *"market" is contract only*
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount the amount of currency to trade
         * @param {float} [price] *ignored in "market" orders* the price at which the order is to be fullfilled at in units of the quote currency
         * @param {object} [params]  extra parameters specific to the exchange API endpoint
         * @param {float} [params.stopPrice] The price at which a trigger order is triggered at
         * @param {string} [params.timeInForce] "GTC", "IOC", or "PO"
         * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
         * @param {int} [params.iceberg] Amount to display for the iceberg order, Null or 0 for normal orders, Set to -1 to hide the order completely
         * @param {string} [params.text] User defined information
         * @param {string} [params.account] *spot and margin only* "spot", "margin" or "cross_margin"
         * @param {bool} [params.auto_borrow] *margin only* Used in margin or cross margin trading to allow automatic loan of insufficient amount if balance is not enough
         * @param {string} [params.settle] *contract only* Unified Currency Code for settle currency
         * @param {bool} [params.reduceOnly] *contract only* Indicates if this order is to reduce the size of a position
         * @param {bool} [params.close] *contract only* Set as true to close the position, with size set to 0
         * @param {bool} [params.auto_size] *contract only* Set side to close dual-mode position, close_long closes the long side, while close_short the short one, size also needs to be set to 0
         * @param {int} [params.price_type] *contract only* 0 latest deal price, 1 mark price, 2 index price
         * @returns {object|undefined} [An order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const trigger = this.safeValue (params, 'trigger');
        const triggerPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice', triggerPrice);
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isStopLossOrder = stopLossPrice !== undefined;
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        const isStopOrder = isStopLossOrder || isTakeProfitOrder;
        const nonTriggerOrder = !isStopOrder && (trigger === undefined);
        const orderRequest = this.createOrderRequest (symbol, type, side, amount, price, params);
        let response = undefined;
        if (market['spot'] || market['margin']) {
            if (nonTriggerOrder) {
                response = await this.privateSpotPostOrders (orderRequest);
            } else {
                response = await this.privateSpotPostPriceOrders (orderRequest);
            }
        } else if (market['swap']) {
            if (nonTriggerOrder) {
                response = await this.privateFuturesPostSettleOrders (orderRequest);
            } else {
                response = await this.privateFuturesPostSettlePriceOrders (orderRequest);
            }
        } else if (market['future']) {
            if (nonTriggerOrder) {
                response = await this.privateDeliveryPostSettleOrders (orderRequest);
            } else {
                response = await this.privateDeliveryPostSettlePriceOrders (orderRequest);
            }
        } else {
            response = await this.privateOptionsPostOrders (orderRequest);
        }
        // const response = await this[method] (this.deepExtend (request, params));
        //
        // spot
        //
        //     {
        //         "id": "95282841887",
        //         "text": "apiv4",
        //         "create_time": "1637383156",
        //         "update_time": "1637383156",
        //         "create_time_ms": 1637383156017,
        //         "update_time_ms": 1637383156017,
        //         "status": "open",
        //         "currency_pair": "ETH_USDT",
        //         "type": "limit",
        //         "account": "spot",
        //         "side": "buy",
        //         "amount": "0.01",
        //         "price": "3500",
        //         "time_in_force": "gtc",
        //         "iceberg": "0",
        //         "left": "0.01",
        //         "fill_price": "0",
        //         "filled_total": "0",
        //         "fee": "0",
        //         "fee_currency": "ETH",
        //         "point_fee": "0",
        //         "gt_fee": "0",
        //         "gt_discount": false,
        //         "rebated_fee": "0",
        //         "rebated_fee_currency": "USDT"
        //     }
        //
        // spot conditional
        //
        //     {"id": 5891843}
        //
        // futures, perpetual swaps and options
        //
        //     {
        //         "id": 95938572327,
        //         "contract": "ETH_USDT",
        //         "mkfr": "0",
        //         "tkfr": "0.0005",
        //         "tif": "gtc",
        //         "is_reduce_only": false,
        //         "create_time": 1637384600.08,
        //         "price": "3000",
        //         "size": 1,
        //         "refr": "0",
        //         "left": 1,
        //         "text": "api",
        //         "fill_price": "0",
        //         "user": 2436035,
        //         "status": "open",
        //         "is_liq": false,
        //         "refu": 0,
        //         "is_close": false,
        //         "iceberg": 0
        //     }
        //
        // futures and perpetual swaps conditionals
        //
        //     {"id": 7615567}
        //
        return this.parseOrder (response, market);
    }

    async createOrders (orders: OrderRequest[], params = {}) {
        /**
         * @method
         * @name gate#createOrders
         * @description create a list of trade orders
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#create-a-batch-of-orders
         * @param {Array} orders list of orders to create, each object should contain the parameters required by createOrder, namely symbol, type, side, amount, price and params
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const ordersRequests = [];
        const orderSymbols = [];
        for (let i = 0; i < orders.length; i++) {
            const rawOrder = orders[i];
            const marketId = this.safeString (rawOrder, 'symbol');
            orderSymbols.push (marketId);
            const type = this.safeString (rawOrder, 'type');
            const side = this.safeString (rawOrder, 'side');
            const amount = this.safeValue (rawOrder, 'amount');
            const price = this.safeValue (rawOrder, 'price');
            const orderParams = this.safeValue (rawOrder, 'params', {});
            const extendedParams = this.extend (orderParams, params); // the request does not accept extra params since it's a list, so we're extending each order with the common params
            const triggerValue = this.safeValueN (orderParams, [ 'triggerPrice', 'stopPrice', 'takeProfitPrice', 'stopLossPrice' ]);
            if (triggerValue !== undefined) {
                throw new NotSupported (this.id + ' createOrders() does not support advanced order properties (stopPrice, takeProfitPrice, stopLossPrice)');
            }
            extendedParams['textIsRequired'] = true; // Gate.io requires a text parameter for each order here
            const orderRequest = this.createOrderRequest (marketId, type, side, amount, price, extendedParams);
            ordersRequests.push (orderRequest);
        }
        const symbols = this.marketSymbols (orderSymbols, undefined, false, true, true);
        const market = this.market (symbols[0]);
        if (market['future'] || market['option']) {
            throw new NotSupported (this.id + ' createOrders() does not support futures or options markets');
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.privateSpotPostBatchOrders (ordersRequests);
        } else if (market['swap']) {
            response = await this.privateFuturesPostSettleBatchOrders (ordersRequests);
        }
        return this.parseOrders (response);
    }

    createOrderRequest (symbol: string, type: OrderType, side: OrderSide, amount, price = undefined, params = {}) {
        const market = this.market (symbol);
        const contract = market['contract'];
        const trigger = this.safeValue (params, 'trigger');
        const triggerPrice = this.safeValue2 (params, 'triggerPrice', 'stopPrice');
        const stopLossPrice = this.safeValue (params, 'stopLossPrice', triggerPrice);
        const takeProfitPrice = this.safeValue (params, 'takeProfitPrice');
        const isStopLossOrder = stopLossPrice !== undefined;
        const isTakeProfitOrder = takeProfitPrice !== undefined;
        const isStopOrder = isStopLossOrder || isTakeProfitOrder;
        if (isStopLossOrder && isTakeProfitOrder) {
            throw new ExchangeError (this.id + ' createOrder() stopLossPrice and takeProfitPrice cannot both be defined');
        }
        const reduceOnly = this.safeValue (params, 'reduceOnly');
        const exchangeSpecificTimeInForce = this.safeStringLowerN (params, [ 'timeInForce', 'tif', 'time_in_force' ]);
        let postOnly = undefined;
        [ postOnly, params ] = this.handlePostOnly (type === 'market', exchangeSpecificTimeInForce === 'poc', params);
        let timeInForce = this.handleTimeInForce (params);
        if (postOnly) {
            timeInForce = 'poc';
        }
        // we only omit the unified params here
        // this is because the other params will get extended into the request
        params = this.omit (params, [ 'stopPrice', 'triggerPrice', 'stopLossPrice', 'takeProfitPrice', 'reduceOnly', 'timeInForce', 'postOnly' ]);
        const isLimitOrder = (type === 'limit');
        const isMarketOrder = (type === 'market');
        if (isLimitOrder && price === undefined) {
            throw new ArgumentsRequired (this.id + ' createOrder () requires a price argument for ' + type + ' orders');
        }
        if (isMarketOrder) {
            if ((timeInForce === 'poc') || (timeInForce === 'gtc')) {
                throw new ExchangeError (this.id + ' createOrder () timeInForce for market order can only be "FOK" or "IOC"');
            } else {
                if (timeInForce === undefined) {
                    const defaultTif = this.safeString (this.options, 'defaultTimeInForce', 'IOC');
                    const exchangeSpecificTif = this.safeString (this.options['timeInForce'], defaultTif, 'ioc');
                    timeInForce = exchangeSpecificTif;
                }
            }
            if (contract) {
                price = 0;
            }
        }
        if (contract) {
            const amountToPrecision = this.amountToPrecision (symbol, amount);
            const signedAmount = (side === 'sell') ? Precise.stringNeg (amountToPrecision) : amountToPrecision;
            amount = parseInt (signedAmount);
        }
        let request = undefined;
        const nonTriggerOrder = !isStopOrder && (trigger === undefined);
        if (nonTriggerOrder) {
            if (contract) {
                // contract order
                request = {
                    'contract': market['id'], // filled in prepareRequest above
                    'size': amount, // int64, positive = bid, negative = ask
                    // 'iceberg': 0, // int64, display size for iceberg order, 0 for non-iceberg, note that you will have to pay the taker fee for the hidden size
                    // 'close': false, // true to close the position, with size set to 0
                    // 'reduce_only': false, // St as true to be reduce-only order
                    // 'tif': 'gtc', // gtc, ioc, poc PendingOrCancelled == postOnly order
                    // 'text': clientOrderId, // 't-abcdef1234567890',
                    // 'auto_size': '', // close_long, close_short, note size also needs to be set to 0
                };
                if (!market['option']) {
                    request['settle'] = market['settleId']; // filled in prepareRequest above
                }
                if (isMarketOrder) {
                    request['price'] = price; // set to 0 for market orders
                } else {
                    request['price'] = this.priceToPrecision (symbol, price);
                }
                if (reduceOnly !== undefined) {
                    request['reduce_only'] = reduceOnly;
                }
                if (timeInForce !== undefined) {
                    request['tif'] = timeInForce;
                }
            } else {
                let marginMode = undefined;
                [ marginMode, params ] = this.getMarginMode (false, params);
                // spot order
                request = {
                    // 'text': clientOrderId, // 't-abcdef1234567890',
                    'currency_pair': market['id'], // filled in prepareRequest above
                    'type': type,
                    'account': marginMode, // 'spot', 'margin', 'cross_margin'
                    'side': side,
                    // 'time_in_force': 'gtc', // gtc, ioc, poc PendingOrCancelled == postOnly order
                    // 'iceberg': 0, // amount to display for the iceberg order, null or 0 for normal orders, set to -1 to hide the order completely
                    // 'auto_borrow': false, // used in margin or cross margin trading to allow automatic loan of insufficient amount if balance is not enough
                    // 'auto_repay': false, // automatic repayment for automatic borrow loan generated by cross margin order, diabled by default
                };
                const createMarketBuyOrderRequiresPrice = this.safeValue (this.options, 'createMarketBuyOrderRequiresPrice', true);
                if (isMarketOrder && (side === 'buy')) {
                    if (createMarketBuyOrderRequiresPrice) {
                        if (price === undefined) {
                            throw new InvalidOrder (this.id + ' createOrder() requires price argument for market buy orders on spot markets to calculate the total amount to spend (amount * price), alternatively set the createMarketBuyOrderRequiresPrice option to false and pass in the cost to spend into the amount parameter');
                        } else {
                            const amountString = this.numberToString (amount);
                            const priceString = this.numberToString (price);
                            const cost = this.parseNumber (Precise.stringMul (amountString, priceString));
                            request['amount'] = this.costToPrecision (symbol, cost);
                        }
                    } else {
                        const cost = this.safeNumber (params, 'cost', amount);
                        params = this.omit (params, 'cost');
                        request['amount'] = this.costToPrecision (symbol, cost);
                    }
                } else {
                    request['amount'] = this.amountToPrecision (symbol, amount);
                }
                if (isLimitOrder) {
                    request['price'] = this.priceToPrecision (symbol, price);
                }
                if (timeInForce !== undefined) {
                    request['time_in_force'] = timeInForce;
                }
            }
            let clientOrderId = this.safeString2 (params, 'text', 'clientOrderId');
            const textIsRequired = this.safeValue (params, 'textIsRequired', false);
            if (clientOrderId !== undefined) {
                // user-defined, must follow the rules if not empty
                //     prefixed with t-
                //     no longer than 28 bytes without t- prefix
                //     can only include 0-9, A-Z, a-z, underscores (_), hyphens (-) or dots (.)
                if (clientOrderId.length > 28) {
                    throw new BadRequest (this.id + ' createOrder () clientOrderId or text param must be up to 28 characters');
                }
                params = this.omit (params, [ 'text', 'clientOrderId', 'textIsRequired' ]);
                if (clientOrderId[0] !== 't') {
                    clientOrderId = 't-' + clientOrderId;
                }
                request['text'] = clientOrderId;
            } else {
                if (textIsRequired) {
                    // batchOrders requires text in the request
                    request['text'] = 't-' + this.uuid16 ();
                }
            }
        } else {
            if (market['option']) {
                throw new NotSupported (this.id + ' createOrder() conditional option orders are not supported');
            }
            if (contract) {
                // contract conditional order
                request = {
                    'initial': {
                        'contract': market['id'],
                        'size': amount, // positive = buy, negative = sell, set to 0 to close the position
                        'price': this.priceToPrecision (symbol, price), // set to 0 to use market price
                        // 'close': false, // set to true if trying to close the position
                        // 'tif': 'gtc', // gtc, ioc, if using market price, only ioc is supported
                        // 'text': clientOrderId, // web, api, app
                        // 'reduce_only': false,
                    },
                    'settle': market['settleId'],
                };
                if (trigger === undefined) {
                    let rule = undefined;
                    let triggerOrderPrice = undefined;
                    if (isStopLossOrder) {
                        // we let trigger orders be aliases for stopLoss orders because
                        // gateio doesn't accept conventional trigger orders for spot markets
                        rule = (side === 'buy') ? 1 : 2;
                        triggerOrderPrice = this.priceToPrecision (symbol, stopLossPrice);
                    } else if (isTakeProfitOrder) {
                        rule = (side === 'buy') ? 2 : 1;
                        triggerOrderPrice = this.priceToPrecision (symbol, takeProfitPrice);
                    }
                    const priceType = this.safeInteger (params, 'price_type', 0);
                    if (priceType < 0 || priceType > 2) {
                        throw new BadRequest (this.id + ' createOrder () price_type should be 0 latest deal price, 1 mark price, 2 index price');
                    }
                    params = this.omit (params, [ 'price_type' ]);
                    request['trigger'] = {
                        // 'strategy_type': 0, // 0 = by price, 1 = by price gap, only 0 is supported currently
                        'price_type': priceType, // 0 latest deal price, 1 mark price, 2 index price
                        'price': this.priceToPrecision (symbol, triggerOrderPrice), // price or gap
                        'rule': rule, // 1 means price_type >= price, 2 means price_type <= price
                        // 'expiration': expiration, how many seconds to wait for the condition to be triggered before cancelling the order
                    };
                }
                if (reduceOnly !== undefined) {
                    request['initial']['reduce_only'] = reduceOnly;
                }
                if (timeInForce !== undefined) {
                    request['initial']['tif'] = timeInForce;
                }
            } else {
                // spot conditional order
                const options = this.safeValue (this.options, 'createOrder', {});
                let marginMode = undefined;
                [ marginMode, params ] = this.getMarginMode (true, params);
                if (timeInForce === undefined) {
                    timeInForce = 'gtc';
                }
                request = {
                    'put': {
                        'type': type,
                        'side': side,
                        'price': this.priceToPrecision (symbol, price),
                        'amount': this.amountToPrecision (symbol, amount),
                        'account': marginMode,
                        'time_in_force': timeInForce, // gtc, ioc (ioc is for taker only, so shouldnt't be in conditional order)
                    },
                    'market': market['id'],
                };
                if (trigger === undefined) {
                    const defaultExpiration = this.safeInteger (options, 'expiration');
                    const expiration = this.safeInteger (params, 'expiration', defaultExpiration);
                    let rule = undefined;
                    let triggerOrderPrice = undefined;
                    if (isStopLossOrder) {
                        // we let trigger orders be aliases for stopLoss orders because
                        // gateio doesn't accept conventional trigger orders for spot markets
                        rule = (side === 'buy') ? '>=' : '<=';
                        triggerOrderPrice = this.priceToPrecision (symbol, stopLossPrice);
                    } else if (isTakeProfitOrder) {
                        rule = (side === 'buy') ? '<=' : '>=';
                        triggerOrderPrice = this.priceToPrecision (symbol, takeProfitPrice);
                    }
                    request['trigger'] = {
                        'price': this.priceToPrecision (symbol, triggerOrderPrice),
                        'rule': rule, // >= triggered when market price larger than or equal to price field, <= triggered when market price less than or equal to price field
                        'expiration': expiration, // required, how long (in seconds) to wait for the condition to be triggered before cancelling the order
                    };
                }
            }
        }
        return this.extend (request, params);
    }

    async editOrder (id: string, symbol, type, side, amount = undefined, price = undefined, params = {}) {
        /**
         * @method
         * @name gate#editOrder
         * @description edit a trade order, gate currently only supports the modification of the price or amount fields
         * @see https://www.gate.io/docs/developers/apiv4/en/#amend-an-order
         * @see https://www.gate.io/docs/developers/apiv4/en/#amend-an-order-2
         * @param {string} id order id
         * @param {string} symbol unified symbol of the market to create an order in
         * @param {string} type 'market' or 'limit'
         * @param {string} side 'buy' or 'sell'
         * @param {float} amount how much of the currency you want to trade in units of the base currency
         * @param {float} [price] the price at which the order is to be fullfilled, in units of the base currency, ignored in market orders
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} an [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ marketType, query ] = this.handleMarketTypeAndParams ('editOrder', market, params);
        const account = this.convertTypeToAccount (marketType);
        const isLimitOrder = (type === 'limit');
        if (account === 'spot') {
            if (!isLimitOrder) {
                // exchange doesn't have market orders for spot
                throw new InvalidOrder (this.id + ' editOrder() does not support ' + type + ' orders for ' + marketType + ' markets');
            }
        }
        const request = {
            'order_id': id,
            'currency_pair': market['id'],
            'account': account,
        };
        if (amount !== undefined) {
            request['amount'] = this.amountToPrecision (symbol, amount);
        }
        if (price !== undefined) {
            request['price'] = this.priceToPrecision (symbol, price);
        }
        let response = undefined;
        if (market['spot']) {
            response = await this.privateSpotPatchOrdersOrderId (this.extend (request, query));
        } else {
            request['settle'] = market['settleId'];
            response = await this.privateFuturesPutSettleOrdersOrderId (this.extend (request, query));
        }
        //
        //     {
        //         "id": "243233276443",
        //         "text": "apiv4",
        //         "create_time": "1670908873",
        //         "update_time": "1670914102",
        //         "create_time_ms": 1670908873077,
        //         "update_time_ms": 1670914102241,
        //         "status": "open",
        //         "currency_pair": "ADA_USDT",
        //         "type": "limit",
        //         "account": "spot",
        //         "side": "sell",
        //         "amount": "10",
        //         "price": "0.6",
        //         "time_in_force": "gtc",
        //         "iceberg": "0",
        //         "left": "10",
        //         "fill_price": "0",
        //         "filled_total": "0",
        //         "fee": "0",
        //         "fee_currency": "USDT",
        //         "point_fee": "0",
        //         "gt_fee": "0",
        //         "gt_maker_fee": "0",
        //         "gt_taker_fee": "0",
        //         "gt_discount": false,
        //         "rebated_fee": "0",
        //         "rebated_fee_currency": "ADA"
        //     }
        //
        return this.parseOrder (response, market);
    }

    parseOrderStatus (status) {
        const statuses = {
            'open': 'open',
            '_new': 'open',
            'filled': 'closed',
            'cancelled': 'canceled',
            'liquidated': 'closed',
            'ioc': 'canceled',
            'failed': 'canceled',
            'expired': 'canceled',
            'finished': 'closed',
            'succeeded': 'closed',
        };
        return this.safeString (statuses, status, status);
    }

    parseOrder (order, market: Market = undefined): Order {
        //
        // SPOT
        // createOrder/cancelOrder/fetchOrder/editOrder
        //
        //    {
        //        "id": "62364648575",
        //        "text": "apiv4",
        //        "create_time": "1626354834",
        //        "update_time": "1626354834",
        //        "create_time_ms": "1626354833544",
        //        "update_time_ms": "1626354833544",
        //        "status": "open",
        //        "currency_pair": "BTC_USDT",
        //        "type": "limit",
        //        "account": "spot",
        //        "side": "buy",
        //        "amount": "0.0001",
        //        "price": "30000",
        //        "time_in_force": "gtc",
        //        "iceberg": "0",
        //        "left": "0.0001",
        //        "fill_price": "0",
        //        "filled_total": "0",
        //        "fee": "0",
        //        "fee_currency": "BTC",
        //        "point_fee": "0",
        //        "gt_fee": "0",
        //        "gt_discount": true,
        //        "rebated_fee": "0",
        //        "rebated_fee_currency": "USDT"
        //     }
        //
        // SPOT TRIGGER ORDERS
        // createOrder
        //
        //    {
        //        "id": 12604556
        //    }
        //
        // fetchOrder/cancelOrder
        //
        //    {
        //        "market": "ADA_USDT",
        //        "user": 6392049,
        //        "trigger": {
        //            "price": "1.08", // stopPrice
        //            "rule": "\u003e=",
        //            "expiration": 86400
        //        },
        //        "put": {
        //            "type": "limit",
        //            "side": "buy",
        //            "price": "1.08", // order price
        //            "amount": "1.00000000000000000000",
        //            "account": "normal",
        //            "time_in_force": "gtc"
        //        },
        //        "id": 71639298,
        //        "ctime": 1643945985,
        //        "status": "open"
        //    }
        //
        // FUTURE, SWAP AND OPTION
        // createOrder/cancelOrder/fetchOrder
        //
        //    {
        //        "id": 123028481731,
        //        "contract": "ADA_USDT",
        //        "mkfr": "-0.00005",
        //        "tkfr": "0.00048",
        //        "tif": "ioc",
        //        "is_reduce_only": false,
        //        "create_time": 1643950262.68,
        //        "finish_time": 1643950262.68,
        //        "price": "0",
        //        "size": 1,
        //        "refr": "0",
        //        "left":0,
        //        "text": "api",
        //        "fill_price": "1.05273",
        //        "user":6329238,
        //        "finish_as": "filled",
        //        "status": "finished",
        //        "is_liq": false,
        //        "refu":0,
        //        "is_close": false,
        //        "iceberg": 0
        //    }
        //
        // TRIGGER ORDERS (FUTURE AND SWAP)
        // createOrder
        //
        //    {
        //        "id": 12604556
        //    }
        //
        // fetchOrder/cancelOrder
        //
        //    {
        //        "user": 6320300,
        //        "trigger": {
        //            "strategy_type": 0,
        //            "price_type": 0,
        //            "price": "1.03", // stopPrice
        //            "rule": 2,
        //            "expiration": 0
        //        },
        //        "initial": {
        //            "contract": "ADA_USDT",
        //            "size": -1,
        //            "price": "1.02",
        //            "tif": "gtc",
        //            "text": "",
        //            "iceberg": 0,
        //            "is_close": false,
        //            "is_reduce_only": false,
        //            "auto_size": ""
        //        },
        //        "id": 126393906,
        //        "trade_id": 0,
        //        "status": "open",
        //        "reason": "",
        //        "create_time": 1643953482,
        //        "finish_time": 1643953482,
        //        "is_stop_order": false,
        //        "stop_trigger": {
        //            "rule": 0,
        //            "trigger_price": "",
        //            "order_price": ""
        //        },
        //        "me_order_id": 0,
        //        "order_type": ""
        //    }
        //
        //    {
        //        "text": "t-d18baf9ac44d82e2",
        //        "succeeded": false,
        //        "label": "BALANCE_NOT_ENOUGH",
        //        "message": "Not enough balance"
        //    }
        //
        const succeeded = this.safeValue (order, 'succeeded', true);
        if (!succeeded) {
            // cancelOrders response
            return this.safeOrder ({
                'clientOrderId': this.safeString (order, 'text'),
                'info': order,
                'status': 'rejected',
            });
        }
        const put = this.safeValue2 (order, 'put', 'initial', {});
        const trigger = this.safeValue (order, 'trigger', {});
        let contract = this.safeString (put, 'contract');
        let type = this.safeString (put, 'type');
        let timeInForce = this.safeStringUpper2 (put, 'time_in_force', 'tif');
        let amount = this.safeString2 (put, 'amount', 'size');
        let side = this.safeString (put, 'side');
        let price = this.safeString (put, 'price');
        contract = this.safeString (order, 'contract', contract);
        type = this.safeString (order, 'type', type);
        timeInForce = this.safeStringUpper2 (order, 'time_in_force', 'tif', timeInForce);
        if (timeInForce === 'POC') {
            timeInForce = 'PO';
        }
        const postOnly = (timeInForce === 'PO');
        amount = this.safeString2 (order, 'amount', 'size', amount);
        side = this.safeString (order, 'side', side);
        price = this.safeString (order, 'price', price);
        let remainingString = this.safeString (order, 'left');
        let cost = this.safeString (order, 'filled_total');
        const triggerPrice = this.safeNumber (trigger, 'price');
        let average = this.safeNumber2 (order, 'avg_deal_price', 'fill_price');
        if (triggerPrice) {
            remainingString = amount;
            cost = '0';
        }
        if (contract) {
            const isMarketOrder = Precise.stringEquals (price, '0') && (timeInForce === 'IOC');
            type = isMarketOrder ? 'market' : 'limit';
            side = Precise.stringGt (amount, '0') ? 'buy' : 'sell';
        }
        const rawStatus = this.safeStringN (order, [ 'finish_as', 'status', 'open' ]);
        let timestamp = this.safeInteger (order, 'create_time_ms');
        if (timestamp === undefined) {
            timestamp = this.safeTimestamp2 (order, 'create_time', 'ctime');
        }
        let lastTradeTimestamp = this.safeInteger (order, 'update_time_ms');
        if (lastTradeTimestamp === undefined) {
            lastTradeTimestamp = this.safeTimestamp2 (order, 'update_time', 'finish_time');
        }
        const marketType = ('currency_pair' in order) ? 'spot' : 'contract';
        const exchangeSymbol = this.safeString2 (order, 'currency_pair', 'market', contract);
        const symbol = this.safeSymbol (exchangeSymbol, market, '_', marketType);
        // Everything below this(above return) is related to fees
        const fees = [];
        const gtFee = this.safeString (order, 'gt_fee');
        if (gtFee) {
            fees.push ({
                'currency': 'GT',
                'cost': gtFee,
            });
        }
        const fee = this.safeString (order, 'fee');
        if (fee) {
            fees.push ({
                'currency': this.safeCurrencyCode (this.safeString (order, 'fee_currency')),
                'cost': fee,
            });
        }
        const rebate = this.safeString (order, 'rebated_fee');
        if (rebate) {
            fees.push ({
                'currency': this.safeCurrencyCode (this.safeString (order, 'rebated_fee_currency')),
                'cost': Precise.stringNeg (rebate),
            });
        }
        const numFeeCurrencies = fees.length;
        const multipleFeeCurrencies = numFeeCurrencies > 1;
        const status = this.parseOrderStatus (rawStatus);
        let remaining = Precise.stringAbs (remainingString);
        // handle spot market buy
        const account = this.safeString (order, 'account'); // using this instead of market type because of the conflicting ids
        if (account === 'spot') {
            const averageString = this.safeString (order, 'avg_deal_price');
            average = this.parseNumber (averageString);
            if ((type === 'market') && (side === 'buy')) {
                remaining = Precise.stringDiv (remainingString, averageString);
                price = undefined; // arrives as 0
                cost = amount;
                amount = Precise.stringDiv (amount, averageString);
            }
        }
        return this.safeOrder ({
            'id': this.safeString (order, 'id'),
            'clientOrderId': this.safeString (order, 'text'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'lastTradeTimestamp': lastTradeTimestamp,
            'status': status,
            'symbol': symbol,
            'type': type,
            'timeInForce': timeInForce,
            'postOnly': postOnly,
            'reduceOnly': this.safeValue (order, 'is_reduce_only'),
            'side': side,
            'price': price,
            'stopPrice': triggerPrice,
            'triggerPrice': triggerPrice,
            'average': average,
            'amount': Precise.stringAbs (amount),
            'cost': Precise.stringAbs (cost),
            'filled': undefined,
            'remaining': remaining,
            'fee': multipleFeeCurrencies ? undefined : this.safeValue (fees, 0),
            'fees': multipleFeeCurrencies ? fees : [],
            'trades': undefined,
            'info': order,
        }, market);
    }

    async fetchOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchOrder
         * @description Retrieves information on an order
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-3
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-a-single-order-4
         * @param {string} id Order id
         * @param {string} symbol Unified market symbol, *required for spot and margin*
         * @param {object} [params] Parameters specified by the exchange api
         * @param {bool} [params.stop] True if the order being fetched is a trigger order
         * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
         * @param {string} [params.type] 'spot', 'swap', or 'future', if not provided this.options['defaultMarginMode'] is used
         * @param {string} [params.settle] 'btc' or 'usdt' - settle currency for perpetual swap and future - market settle currency is used if symbol !== undefined, default="usdt" for swap and "btc" for future
         * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const stop = this.safeValue2 (params, 'is_stop_order', 'stop', false);
        params = this.omit (params, [ 'is_stop_order', 'stop' ]);
        let clientOrderId = this.safeString2 (params, 'text', 'clientOrderId');
        let orderId = id;
        if (clientOrderId !== undefined) {
            params = this.omit (params, [ 'text', 'clientOrderId' ]);
            if (clientOrderId[0] !== 't') {
                clientOrderId = 't-' + clientOrderId;
            }
            orderId = clientOrderId;
        }
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOrder', market, params);
        const contract = (type === 'swap') || (type === 'future') || (type === 'option');
        const [ request, requestParams ] = contract ? this.prepareRequest (market, type, query) : this.spotOrderPrepareRequest (market, stop, query);
        request['order_id'] = orderId;
        let response = undefined;
        if (type === 'spot' || type === 'margin') {
            if (stop) {
                response = await this.privateSpotGetPriceOrdersOrderId (this.extend (request, requestParams));
            } else {
                response = await this.privateSpotGetOrdersOrderId (this.extend (request, requestParams));
            }
        } else if (type === 'swap') {
            if (stop) {
                response = await this.privateFuturesGetSettlePriceOrdersOrderId (this.extend (request, requestParams));
            } else {
                response = await this.privateFuturesGetSettleOrdersOrderId (this.extend (request, requestParams));
            }
        } else if (type === 'future') {
            if (stop) {
                response = await this.privateDeliveryGetSettlePriceOrdersOrderId (this.extend (request, requestParams));
            } else {
                response = await this.privateDeliveryGetSettleOrdersOrderId (this.extend (request, requestParams));
            }
        } else if (type === 'option') {
            response = await this.privateOptionsGetOrdersOrderId (this.extend (request, requestParams));
        } else {
            throw new NotSupported (this.id + ' fetchOrder() not support this market type');
        }
        return this.parseOrder (response, market);
    }

    async fetchOpenOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name gate#fetchOpenOrders
         * @description fetch all unfilled currently open orders
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-open-orders
         * @param {string} symbol unified market symbol
         * @param {int} [since] the earliest time in ms to fetch open orders for
         * @param {int} [limit] the maximum number of  open orders structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] true for fetching stop orders
         * @param {string} [params.type] spot, margin, swap or future, if not provided this.options['defaultType'] is used
         * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for type='margin', if not provided this.options['defaultMarginMode'] is used
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersByStatus ('open', symbol, since, limit, params) as Order[];
    }

    async fetchClosedOrders (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}): Promise<Order[]> {
        /**
         * @method
         * @name gate#fetchClosedOrders
         * @description fetches information on multiple closed orders made by the user
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-orders
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-running-auto-order-list
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-orders
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-auto-orders
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-futures-orders-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-auto-orders-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-options-orders
         * @param {string} symbol unified market symbol of the market orders were made in
         * @param {int} [since] the earliest time in ms to fetch orders for
         * @param {int} [limit] the maximum number of  orde structures to retrieve
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {bool} [params.stop] true for fetching stop orders
         * @param {string} [params.type] spot, swap or future, if not provided this.options['defaultType'] is used
         * @param {string} [params.marginMode] 'cross' or 'isolated' - marginMode for margin trading if not provided this.options['defaultMarginMode'] is used
         * @returns {Order[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        return await this.fetchOrdersByStatus ('finished', symbol, since, limit, params) as Order[];
    }

    async fetchOrdersByStatus (status, symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        await this.loadMarkets ();
        let market = undefined;
        if (symbol !== undefined) {
            market = this.market (symbol);
            symbol = market['symbol'];
        }
        const stop = this.safeValue (params, 'stop');
        params = this.omit (params, 'stop');
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchOrdersByStatus', market, params);
        const spot = (type === 'spot') || (type === 'margin');
        const [ request, requestParams ] = spot ? this.multiOrderSpotPrepareRequest (market, stop, query) : this.prepareRequest (market, type, query);
        if (status === 'closed') {
            status = 'finished';
        }
        request['status'] = status;
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined && spot) {
            request['from'] = this.parseToInt (since / 1000);
        }
        const openSpotOrders = spot && (status === 'open') && !stop;
        let response = undefined;
        if (type === 'spot' || type === 'margin') {
            if (openSpotOrders) {
                response = await this.privateSpotGetOpenOrders (this.extend (request, requestParams));
            } else if (stop) {
                response = await this.privateSpotGetPriceOrders (this.extend (request, requestParams));
            } else {
                response = await this.privateSpotGetOrders (this.extend (request, requestParams));
            }
        } else if (type === 'swap') {
            if (stop) {
                response = await this.privateFuturesGetSettlePriceOrders (this.extend (request, requestParams));
            } else {
                response = await this.privateFuturesGetSettleOrders (this.extend (request, requestParams));
            }
        } else if (type === 'future') {
            if (stop) {
                response = await this.privateDeliveryGetSettlePriceOrders (this.extend (request, requestParams));
            } else {
                response = await this.privateDeliveryGetSettleOrders (this.extend (request, requestParams));
            }
        } else if (type === 'option') {
            response = await this.privateOptionsGetOrders (this.extend (request, requestParams));
        } else {
            throw new NotSupported (this.id + ' fetchOrders() not support this market type');
        }
        //
        // spot open orders
        //
        //    [
        //        {
        //            "currency_pair": "ADA_USDT",
        //            "total": 2,
        //            "orders": [
        //                {
        //                    "id": "155498539874",
        //                    "text": "apiv4",
        //                    "create_time": "1652406843",
        //                    "update_time": "1652406843",
        //                    "create_time_ms": 1652406843295,
        //                    "update_time_ms": 1652406843295,
        //                    "status": "open",
        //                    "currency_pair": "ADA_USDT",
        //                    "type": "limit",
        //                    "account": "spot",
        //                    "side": "buy",
        //                    "amount": "3",
        //                    "price": "0.35",
        //                    "time_in_force": "gtc",
        //                    "iceberg": "0",
        //                    "left": "3",
        //                    "fill_price": "0",
        //                    "filled_total": "0",
        //                    "fee": "0",
        //                    "fee_currency": "ADA",
        //                    "point_fee": "0",
        //                    "gt_fee": "0",
        //                    "gt_discount": false,
        //                    "rebated_fee": "0",
        //                    "rebated_fee_currency": "USDT"
        //                },
        //                ...
        //            ]
        //        },
        //        ...
        //    ]
        //
        // spot
        //
        //    [
        //        {
        //           "id": "8834234273",
        //           "text": "3",
        //           "create_time": "1635406193",
        //           "update_time": "1635406193",
        //           "create_time_ms": 1635406193361,
        //           "update_time_ms": 1635406193361,
        //           "status": "closed",
        //           "currency_pair": "BTC_USDT",
        //           "type": "limit",
        //           "account": "spot", // margin for margin orders
        //           "side": "sell",
        //           "amount": "0.0002",
        //           "price": "58904.01",
        //           "time_in_force": "gtc",
        //           "iceberg": "0",
        //           "left": "0.0000",
        //           "fill_price": "11.790516",
        //           "filled_total": "11.790516",
        //           "fee": "0.023581032",
        //           "fee_currency": "USDT",
        //           "point_fee": "0",
        //           "gt_fee": "0",
        //           "gt_discount": false,
        //           "rebated_fee_currency": "BTC"
        //        }
        //    ]
        //
        // spot stop
        //
        //    [
        //        {
        //            "market": "ADA_USDT",
        //            "user": 10406147,
        //            "trigger": {
        //                "price": "0.65",
        //                "rule": "\u003c=",
        //                "expiration": 86400
        //            },
        //            "put": {
        //                "type": "limit",
        //                "side": "sell",
        //                "price": "0.65",
        //                "amount": "2.00000000000000000000",
        //                "account": "normal",  // margin for margin orders
        //                "time_in_force": "gtc"
        //            },
        //            "id": 8449909,
        //            "ctime": 1652188982,
        //            "status": "open"
        //        }
        //    ]
        //
        // swap
        //
        //    [
        //        {
        //           "status": "finished",
        //           "size": -1,
        //           "left": 0,
        //           "id": 82750739203,
        //           "is_liq": false,
        //           "is_close": false,
        //           "contract": "BTC_USDT",
        //           "text": "web",
        //           "fill_price": "60721.3",
        //           "finish_as": "filled",
        //           "iceberg": 0,
        //           "tif": "ioc",
        //           "is_reduce_only": true,
        //           "create_time": 1635403475.412,
        //           "finish_time": 1635403475.4127,
        //           "price": "0"
        //        }
        //    ]
        //
        // option
        //
        //     [
        //         {
        //             "id": 2593450699,
        //             "contract": "BTC_USDT-20230601-27500-C",
        //             "mkfr": "0.0003",
        //             "tkfr": "0.0003",
        //             "tif": "gtc",
        //             "is_reduce_only": false,
        //             "create_time": 1685503873,
        //             "price": "200",
        //             "size": 1,
        //             "refr": "0",
        //             "left": 1,
        //             "text": "api",
        //             "fill_price": "0",
        //             "user": 5691076,
        //             "status": "open",
        //             "is_liq": false,
        //             "refu": 0,
        //             "is_close": false,
        //             "iceberg": 0
        //         }
        //     ]
        //
        let result = response;
        if (openSpotOrders) {
            result = [];
            for (let i = 0; i < response.length; i++) {
                const ordersInner = this.safeValue (response[i], 'orders');
                result = this.arrayConcat (result, ordersInner);
            }
        }
        const orders = this.parseOrders (result, market, since, limit);
        return this.filterBySymbolSinceLimit (orders, symbol, since, limit);
    }

    async cancelOrder (id: string, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name gate#cancelOrder
         * @description Cancels an open order
         * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order
         * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order-3
         * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-a-single-order-4
         * @param {string} id Order id
         * @param {string} symbol Unified market symbol
         * @param {object} [params] Parameters specified by the exchange api
         * @param {bool} [params.stop] True if the order to be cancelled is a trigger order
         * @returns An [order structure]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const stop = this.safeValue2 (params, 'is_stop_order', 'stop', false);
        params = this.omit (params, [ 'is_stop_order', 'stop' ]);
        const [ type, query ] = this.handleMarketTypeAndParams ('cancelOrder', market, params);
        const [ request, requestParams ] = (type === 'spot' || type === 'margin') ? this.spotOrderPrepareRequest (market, stop, query) : this.prepareRequest (market, type, query);
        request['order_id'] = id;
        let response = undefined;
        if (type === 'spot' || type === 'margin') {
            if (stop) {
                response = await this.privateSpotDeletePriceOrdersOrderId (this.extend (request, requestParams));
            } else {
                response = await this.privateSpotDeleteOrdersOrderId (this.extend (request, requestParams));
            }
        } else if (type === 'swap') {
            if (stop) {
                response = await this.privateFuturesDeleteSettlePriceOrdersOrderId (this.extend (request, requestParams));
            } else {
                response = await this.privateFuturesDeleteSettleOrdersOrderId (this.extend (request, requestParams));
            }
        } else if (type === 'future') {
            if (stop) {
                response = await this.privateDeliveryDeleteSettlePriceOrdersOrderId (this.extend (request, requestParams));
            } else {
                response = await this.privateDeliveryDeleteSettleOrdersOrderId (this.extend (request, requestParams));
            }
        } else if (type === 'option') {
            response = await this.privateOptionsDeleteOrdersOrderId (this.extend (request, requestParams));
        } else {
            throw new NotSupported (this.id + ' cancelOrder() not support this market type');
        }
        //
        // spot
        //
        //     {
        //         "id": "95282841887",
        //         "text": "apiv4",
        //         "create_time": "1637383156",
        //         "update_time": "1637383235",
        //         "create_time_ms": 1637383156017,
        //         "update_time_ms": 1637383235085,
        //         "status": "cancelled",
        //         "currency_pair": "ETH_USDT",
        //         "type": "limit",
        //         "account": "spot",
        //         "side": "buy",
        //         "amount": "0.01",
        //         "price": "3500",
        //         "time_in_force": "gtc",
        //         "iceberg": "0",
        //         "left": "0.01",
        //         "fill_price": "0",
        //         "filled_total": "0",
        //         "fee": "0",
        //         "fee_currency": "ETH",
        //         "point_fee": "0",
        //         "gt_fee": "0",
        //         "gt_discount": false,
        //         "rebated_fee": "0",
        //         "rebated_fee_currency": "USDT"
        //     }
        //
        // spot conditional
        //
        //     {
        //         "market": "ETH_USDT",
        //         "user": 2436035,
        //         "trigger": {
        //             "price": "3500",
        //             "rule": "\u003c=",
        //             "expiration": 86400
        //         },
        //         "put": {
        //             "type": "limit",
        //             "side": "buy",
        //             "price": "3500",
        //             "amount": "0.01000000000000000000",
        //             "account": "normal",
        //             "time_in_force": "gtc"
        //         },
        //         "id": 5891843,
        //         "ctime": 1637382379,
        //         "ftime": 1637382673,
        //         "status": "canceled"
        //     }
        //
        // swap, future and option
        //
        //     {
        //         "id": "82241928192",
        //         "contract": "BTC_USDT",
        //         "mkfr": "0",
        //         "tkfr": "0.0005",
        //         "tif": "gtc",
        //         "is_reduce_only": false,
        //         "create_time": "1635196145.06",
        //         "finish_time": "1635196233.396",
        //         "price": "61000",
        //         "size": "4",
        //         "refr": "0",
        //         "left": "4",
        //         "text": "web",
        //         "fill_price": "0",
        //         "user": "6693577",
        //         "finish_as": "cancelled",
        //         "status": "finished",
        //         "is_liq": false,
        //         "refu": "0",
        //         "is_close": false,
        //         "iceberg": "0",
        //     }
        //
        return this.parseOrder (response, market);
    }

    async cancelAllOrders (symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name gate#cancelAllOrders
         * @description cancel all open orders
         * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-in-specified-currency-pair
         * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-matched
         * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-matched-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#cancel-all-open-orders-matched-3
         * @param {string} symbol unified market symbol, only orders in the market of this symbol are cancelled when symbol is not undefined
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object[]} a list of [order structures]{@link https://docs.ccxt.com/#/?id=order-structure}
         */
        await this.loadMarkets ();
        const market = (symbol === undefined) ? undefined : this.market (symbol);
        const stop = this.safeValue (params, 'stop');
        params = this.omit (params, 'stop');
        const [ type, query ] = this.handleMarketTypeAndParams ('cancelAllOrders', market, params);
        const [ request, requestParams ] = (type === 'spot') ? this.multiOrderSpotPrepareRequest (market, stop, query) : this.prepareRequest (market, type, query);
        let response = undefined;
        if (type === 'spot' || type === 'margin') {
            if (stop) {
                response = await this.privateSpotDeletePriceOrders (this.extend (request, requestParams));
            } else {
                response = await this.privateSpotDeleteOrders (this.extend (request, requestParams));
            }
        } else if (type === 'swap') {
            if (stop) {
                response = await this.privateFuturesDeleteSettlePriceOrders (this.extend (request, requestParams));
            } else {
                response = await this.privateFuturesDeleteSettleOrders (this.extend (request, requestParams));
            }
        } else if (type === 'future') {
            if (stop) {
                response = await this.privateDeliveryDeleteSettlePriceOrders (this.extend (request, requestParams));
            } else {
                response = await this.privateDeliveryDeleteSettleOrders (this.extend (request, requestParams));
            }
        } else if (type === 'option') {
            response = await this.privateOptionsDeleteOrders (this.extend (request, requestParams));
        } else {
            throw new NotSupported (this.id + ' cancelAllOrders() not support this market type');
        }
        //
        //    [
        //        {
        //            "id": 139797004085,
        //            "contract": "ADA_USDT",
        //            "mkfr": "0",
        //            "tkfr": "0.0005",
        //            "tif": "gtc",
        //            "is_reduce_only": false,
        //            "create_time": 1647911169.343,
        //            "finish_time": 1647911226.849,
        //            "price": "0.8",
        //            "size": 1,
        //            "refr": "0.3",
        //            "left": 1,
        //            "text": "api",
        //            "fill_price": "0",
        //            "user": 6693577,
        //            "finish_as": "cancelled",
        //            "status": "finished",
        //            "is_liq": false,
        //            "refu": 2436035,
        //            "is_close": false,
        //            "iceberg": 0
        //        }
        //        ...
        //    ]
        //
        return this.parseOrders (response, market);
    }

    async transfer (code: string, amount, fromAccount, toAccount, params = {}) {
        /**
         * @method
         * @name gate#transfer
         * @description transfer currency internally between wallets on the same account
         * @see https://www.gate.io/docs/developers/apiv4/en/#transfer-between-trading-accounts
         * @param {string} code unified currency code for currency being transferred
         * @param {float} amount the amount of currency to transfer
         * @param {string} fromAccount the account to transfer currency from
         * @param {string} toAccount the account to transfer currency to
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.symbol] Unified market symbol *required for type == margin*
         * @returns A [transfer structure]{@link https://docs.ccxt.com/#/?id=transfer-structure}
         */
        await this.loadMarkets ();
        const currency = this.currency (code);
        const fromId = this.convertTypeToAccount (fromAccount);
        const toId = this.convertTypeToAccount (toAccount);
        const truncated = this.currencyToPrecision (code, amount);
        const request = {
            'currency': currency['id'],
            'amount': truncated,
        };
        if (!(fromId in this.options['accountsByType'])) {
            request['from'] = 'margin';
            request['currency_pair'] = fromId;
        } else {
            request['from'] = fromId;
        }
        if (!(toId in this.options['accountsByType'])) {
            request['to'] = 'margin';
            request['currency_pair'] = toId;
        } else {
            request['to'] = toId;
        }
        if (fromId === 'margin' || toId === 'margin') {
            const symbol = this.safeString2 (params, 'symbol', 'currency_pair');
            if (symbol === undefined) {
                throw new ArgumentsRequired (this.id + ' transfer requires params["symbol"] for isolated margin transfers');
            }
            const market = this.market (symbol);
            request['currency_pair'] = market['id'];
            params = this.omit (params, 'symbol');
        }
        if ((toId === 'futures') || (toId === 'delivery') || (fromId === 'futures') || (fromId === 'delivery')) {
            request['settle'] = currency['id'];
        }
        const response = await this.privateWalletPostTransfers (this.extend (request, params));
        //
        // according to the docs (however actual response seems to be an empty string '')
        //
        //    {
        //        "currency": "BTC",
        //        "from": "spot",
        //        "to": "margin",
        //        "amount": "1",
        //        "currency_pair": "BTC_USDT"
        //    }
        //
        return this.parseTransfer (response, currency);
    }

    parseTransfer (transfer, currency: Currency = undefined) {
        const timestamp = this.milliseconds ();
        return {
            'id': this.safeString (transfer, 'tx_id'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'currency': this.safeCurrencyCode (undefined, currency),
            'amount': undefined,
            'fromAccount': undefined,
            'toAccount': undefined,
            'status': undefined,
            'info': transfer,
        };
    }

    async setLeverage (leverage, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name gate#setLeverage
         * @description set the level of leverage for a market
         * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-leverage
         * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-leverage-2
         * @param {float} leverage the rate of leverage
         * @param {string} symbol unified market symbol
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} response from the exchange
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' setLeverage() requires a symbol argument');
        }
        // WARNING: THIS WILL INCREASE LIQUIDATION PRICE FOR OPEN ISOLATED LONG POSITIONS
        // AND DECREASE LIQUIDATION PRICE FOR OPEN ISOLATED SHORT POSITIONS
        if ((leverage < 0) || (leverage > 100)) {
            throw new BadRequest (this.id + ' setLeverage() leverage should be between 1 and 100');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ request, query ] = this.prepareRequest (market, undefined, params);
        const defaultMarginMode = this.safeString2 (this.options, 'marginMode', 'defaultMarginMode');
        const crossLeverageLimit = this.safeString (query, 'cross_leverage_limit');
        let marginMode = this.safeString (query, 'marginMode', defaultMarginMode);
        if (crossLeverageLimit !== undefined) {
            marginMode = 'cross';
            leverage = crossLeverageLimit;
        }
        if (marginMode === 'cross' || marginMode === 'cross_margin') {
            request['cross_leverage_limit'] = leverage.toString ();
            request['leverage'] = '0';
        } else {
            request['leverage'] = leverage.toString ();
        }
        let response = undefined;
        if (market['type'] === 'swap') {
            response = await this.privateFuturesPostSettlePositionsContractLeverage (this.extend (request, query));
        } else if (market['type'] === 'future') {
            response = await this.privateDeliveryPostSettlePositionsContractLeverage (this.extend (request, query));
        } else {
            throw new NotSupported (this.id + ' setLeverage() not support this market type');
        }
        //
        //     {
        //         "value": "0",
        //         "leverage": "5",
        //         "mode": "single",
        //         "realised_point": "0",
        //         "contract": "BTC_USDT",
        //         "entry_price": "0",
        //         "mark_price": "62035.86",
        //         "history_point": "0",
        //         "realised_pnl": "0",
        //         "close_order": null,
        //         "size": 0,
        //         "cross_leverage_limit": "0",
        //         "pending_orders": 0,
        //         "adl_ranking": 6,
        //         "maintenance_rate": "0.005",
        //         "unrealised_pnl": "0",
        //         "user": 2436035,
        //         "leverage_max": "100",
        //         "history_pnl": "0",
        //         "risk_limit": "1000000",
        //         "margin": "0",
        //         "last_close_pnl": "0",
        //         "liq_price": "0"
        //     }
        //
        return response;
    }

    parsePosition (position, market: Market = undefined) {
        //
        // swap and future
        //
        //     {
        //         "value": "12.475572",
        //         "leverage": "0",
        //         "mode": "single",
        //         "realised_point": "0",
        //         "contract": "BTC_USDT",
        //         "entry_price": "62422.6",
        //         "mark_price": "62377.86",
        //         "history_point": "0",
        //         "realised_pnl": "-0.00624226",
        //         "close_order":  null,
        //         "size": "2",
        //         "cross_leverage_limit": "25",
        //         "pending_orders": "0",
        //         "adl_ranking": "5",
        //         "maintenance_rate": "0.005",
        //         "unrealised_pnl": "-0.008948",
        //         "user": "663337",
        //         "leverage_max": "100",
        //         "history_pnl": "14.98868396636",
        //         "risk_limit": "1000000",
        //         "margin": "0.740721495056",
        //         "last_close_pnl": "-0.041996015",
        //         "liq_price": "59058.58"
        //     }
        //
        // option
        //
        //     {
        //         "close_order": null,
        //         "size": 1,
        //         "vega": "5.29756",
        //         "theta": "-98.98917",
        //         "gamma": "0.00056",
        //         "delta": "0.68691",
        //         "contract": "BTC_USDT-20230602-26500-C",
        //         "entry_price": "529",
        //         "unrealised_pnl": "-1.0131",
        //         "user": 5691076,
        //         "mark_price": "427.69",
        //         "underlying_price": "26810.2",
        //         "underlying": "BTC_USDT",
        //         "realised_pnl": "-0.08042877",
        //         "mark_iv": "0.4224",
        //         "pending_orders": 0
        //     }
        //
        const contract = this.safeString (position, 'contract');
        market = this.safeMarket (contract, market, '_', 'contract');
        const size = this.safeString (position, 'size');
        let side = undefined;
        if (Precise.stringGt (size, '0')) {
            side = 'long';
        } else if (Precise.stringLt (size, '0')) {
            side = 'short';
        }
        const maintenanceRate = this.safeString (position, 'maintenance_rate');
        const notional = this.safeString (position, 'value');
        const leverage = this.safeString (position, 'leverage');
        let marginMode = undefined;
        if (leverage === '0') {
            marginMode = 'cross';
        } else {
            marginMode = 'isolated';
        }
        const unrealisedPnl = this.safeString (position, 'unrealised_pnl');
        // Initial Position Margin = ( Position Value / Leverage ) + Close Position Fee
        // *The default leverage under the full position is the highest leverage in the market.
        // *Trading fee is charged as Taker Fee Rate (0.075%).
        const takerFee = '0.00075';
        const feePaid = Precise.stringMul (takerFee, notional);
        const initialMarginString = Precise.stringAdd (Precise.stringDiv (notional, leverage), feePaid);
        const timestamp = this.safeInteger (position, 'time_ms');
        return this.safePosition ({
            'info': position,
            'id': undefined,
            'symbol': this.safeString (market, 'symbol'),
            'timestamp': undefined,
            'datetime': undefined,
            'lastUpdateTimestamp': timestamp,
            'initialMargin': this.parseNumber (initialMarginString),
            'initialMarginPercentage': this.parseNumber (Precise.stringDiv (initialMarginString, notional)),
            'maintenanceMargin': this.parseNumber (Precise.stringMul (maintenanceRate, notional)),
            'maintenanceMarginPercentage': this.parseNumber (maintenanceRate),
            'entryPrice': this.safeNumber (position, 'entry_price'),
            'notional': this.parseNumber (notional),
            'leverage': this.safeNumber (position, 'leverage'),
            'unrealizedPnl': this.parseNumber (unrealisedPnl),
            'realizedPnl': this.safeNumber (position, 'realised_pnl'),
            'contracts': this.parseNumber (Precise.stringAbs (size)),
            'contractSize': this.safeValue (market, 'contractSize'),
            // 'realisedPnl': position['realised_pnl'],
            'marginRatio': undefined,
            'liquidationPrice': this.safeNumber (position, 'liq_price'),
            'markPrice': this.safeNumber (position, 'mark_price'),
            'lastPrice': undefined,
            'collateral': this.safeNumber (position, 'margin'),
            'marginMode': marginMode,
            'side': side,
            'percentage': undefined,
            'stopLossPrice': undefined,
            'takeProfitPrice': undefined,
        });
    }

    async fetchPosition (symbol: string, params = {}) {
        /**
         * @method
         * @name gate#fetchPosition
         * @description fetch data on an open contract position
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-single-position
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-single-position-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#get-specified-contract-position
         * @param {string} symbol unified market symbol of the market the position is held in
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['contract']) {
            throw new BadRequest (this.id + ' fetchPosition() supports contract markets only');
        }
        let request = {};
        [ request, params ] = this.prepareRequest (market, market['type'], params);
        const extendedRequest = this.extend (request, params);
        let response = undefined;
        if (market['type'] === 'swap') {
            response = await this.privateFuturesGetSettlePositionsContract (extendedRequest);
        } else if (market['type'] === 'future') {
            response = await this.privateDeliveryGetSettlePositionsContract (extendedRequest);
        } else if (market['type'] === 'option') {
            response = await this.privateOptionsGetPositionsContract (extendedRequest);
        }
        //
        // swap and future
        //
        //     {
        //         "value": "12.475572",
        //         "leverage": "0",
        //         "mode": "single",
        //         "realised_point": "0",
        //         "contract": "BTC_USDT",
        //         "entry_price": "62422.6",
        //         "mark_price": "62377.86",
        //         "history_point": "0",
        //         "realised_pnl": "-0.00624226",
        //         "close_order":  null,
        //         "size": "2",
        //         "cross_leverage_limit": "25",
        //         "pending_orders": "0",
        //         "adl_ranking": "5",
        //         "maintenance_rate": "0.005",
        //         "unrealised_pnl": "-0.008948",
        //         "user": "6693577",
        //         "leverage_max": "100",
        //         "history_pnl": "14.98868396636",
        //         "risk_limit": "1000000",
        //         "margin": "0.740721495056",
        //         "last_close_pnl": "-0.041996015",
        //         "liq_price": "59058.58"
        //     }
        //
        // option
        //
        //     {
        //         "close_order": null,
        //         "size": 1,
        //         "vega": "5.29756",
        //         "theta": "-98.98917",
        //         "gamma": "0.00056",
        //         "delta": "0.68691",
        //         "contract": "BTC_USDT-20230602-26500-C",
        //         "entry_price": "529",
        //         "unrealised_pnl": "-1.0131",
        //         "user": 5691076,
        //         "mark_price": "427.69",
        //         "underlying_price": "26810.2",
        //         "underlying": "BTC_USDT",
        //         "realised_pnl": "-0.08042877",
        //         "mark_iv": "0.4224",
        //         "pending_orders": 0
        //     }
        //
        return this.parsePosition (response, market);
    }

    async fetchPositions (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchPositions
         * @description fetch all open positions
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-positions-of-a-user
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-positions-of-a-user-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-user-s-positions-of-specified-underlying
         * @param {string[]|undefined} symbols Not used by gate, but parsed internally by CCXT
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.settle] 'btc' or 'usdt' - settle currency for perpetual swap and future - default="usdt" for swap and "btc" for future
         * @param {string} [params.type] swap, future or option, if not provided this.options['defaultType'] is used
         * @returns {object[]} a list of [position structure]{@link https://docs.ccxt.com/#/?id=position-structure}
         */
        await this.loadMarkets ();
        let market = undefined;
        symbols = this.marketSymbols (symbols, undefined, true, true, true);
        if (symbols !== undefined) {
            const symbolsLength = symbols.length;
            if (symbolsLength > 0) {
                market = this.market (symbols[0]);
            }
        }
        let type = undefined;
        let request = {};
        [ type, params ] = this.handleMarketTypeAndParams ('fetchPositions', market, params);
        if ((type === undefined) || (type === 'spot')) {
            type = 'swap'; // default to swap
        }
        if (type === 'option') {
            if (symbols !== undefined) {
                const marketId = market['id'];
                const optionParts = marketId.split ('-');
                request['underlying'] = this.safeString (optionParts, 0);
            }
        } else {
            [ request, params ] = this.prepareRequest (undefined, type, params);
        }
        let response = undefined;
        if (type === 'swap') {
            response = await this.privateFuturesGetSettlePositions (this.extend (request, params));
        } else if (type === 'future') {
            response = await this.privateDeliveryGetSettlePositions (this.extend (request, params));
        } else if (type === 'option') {
            response = await this.privateOptionsGetPositions (this.extend (request, params));
        }
        //
        // swap and future
        //
        //     [
        //         {
        //             "value": "12.475572",
        //             "leverage": "0",
        //             "mode": "single",
        //             "realised_point": "0",
        //             "contract": "BTC_USDT",
        //             "entry_price": "62422.6",
        //             "mark_price": "62377.86",
        //             "history_point": "0",
        //             "realised_pnl": "-0.00624226",
        //             "close_order":  null,
        //             "size": "2",
        //             "cross_leverage_limit": "25",
        //             "pending_orders": "0",
        //             "adl_ranking": "5",
        //             "maintenance_rate": "0.005",
        //             "unrealised_pnl": "-0.008948",
        //             "user": "6693577",
        //             "leverage_max": "100",
        //             "history_pnl": "14.98868396636",
        //             "risk_limit": "1000000",
        //             "margin": "0.740721495056",
        //             "last_close_pnl": "-0.041996015",
        //             "liq_price": "59058.58"
        //         }
        //     ]
        //
        // option
        //
        //     [
        //         {
        //             "close_order": null,
        //             "size": 0,
        //             "vega": "0.01907",
        //             "theta": "-3.04888",
        //             "gamma": "0.00001",
        //             "delta": "0.0011",
        //             "contract": "BTC_USDT-20230601-27500-C",
        //             "entry_price": "0",
        //             "unrealised_pnl": "0",
        //             "user": 5691076,
        //             "mark_price": "0.07",
        //             "underlying_price": "26817.27",
        //             "underlying": "BTC_USDT",
        //             "realised_pnl": "0",
        //             "mark_iv": "0.4339",
        //             "pending_orders": 0
        //         }
        //     ]
        //
        return this.parsePositions (response, symbols);
    }

    async fetchLeverageTiers (symbols: Strings = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchLeverageTiers
         * @description retrieve information on the maximum leverage, and maintenance margin for trades of varying trade sizes
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-futures-contracts-2
         * @param {string[]|undefined} symbols list of unified market symbols
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a dictionary of [leverage tiers structures]{@link https://docs.ccxt.com/#/?id=leverage-tiers-structure}, indexed by market symbols
         */
        await this.loadMarkets ();
        const [ type, query ] = this.handleMarketTypeAndParams ('fetchLeverageTiers', undefined, params);
        const [ request, requestParams ] = this.prepareRequest (undefined, type, query);
        if (type !== 'future' && type !== 'swap') {
            throw new BadRequest (this.id + ' fetchLeverageTiers only supports swap and future');
        }
        const method = this.getSupportedMapping (type, {
            'swap': 'publicFuturesGetSettleContracts',
            'future': 'publicDeliveryGetSettleContracts',
        });
        const response = await this[method] (this.extend (request, requestParams));
        //
        // Perpetual swap
        //
        //    [
        //        {
        //            "name": "BTC_USDT",
        //            "type": "direct",
        //            "quanto_multiplier": "0.0001",
        //            "ref_discount_rate": "0",
        //            "order_price_deviate": "0.5",
        //            "maintenance_rate": "0.005",
        //            "mark_type": "index",
        //            "last_price": "38026",
        //            "mark_price": "37985.6",
        //            "index_price": "37954.92",
        //            "funding_rate_indicative": "0.000219",
        //            "mark_price_round": "0.01",
        //            "funding_offset": 0,
        //            "in_delisting": false,
        //            "risk_limit_base": "1000000",
        //            "interest_rate": "0.0003",
        //            "order_price_round": "0.1",
        //            "order_size_min": 1,
        //            "ref_rebate_rate": "0.2",
        //            "funding_interval": 28800,
        //            "risk_limit_step": "1000000",
        //            "leverage_min": "1",
        //            "leverage_max": "100",
        //            "risk_limit_max": "8000000",
        //            "maker_fee_rate": "-0.00025",
        //            "taker_fee_rate": "0.00075",
        //            "funding_rate": "0.002053",
        //            "order_size_max": 1000000,
        //            "funding_next_apply": 1610035200,
        //            "short_users": 977,
        //            "config_change_time": 1609899548,
        //            "trade_size": 28530850594,
        //            "position_size": 5223816,
        //            "long_users": 455,
        //            "funding_impact_value": "60000",
        //            "orders_limit": 50,
        //            "trade_id": 10851092,
        //            "orderbook_id": 2129638396
        //        }
        //    ]
        //
        // Delivery Futures
        //
        //    [
        //        {
        //            "name": "BTC_USDT_20200814",
        //            "underlying": "BTC_USDT",
        //            "cycle": "WEEKLY",
        //            "type": "direct",
        //            "quanto_multiplier": "0.0001",
        //            "mark_type": "index",
        //            "last_price": "9017",
        //            "mark_price": "9019",
        //            "index_price": "9005.3",
        //            "basis_rate": "0.185095",
        //            "basis_value": "13.7",
        //            "basis_impact_value": "100000",
        //            "settle_price": "0",
        //            "settle_price_interval": 60,
        //            "settle_price_duration": 1800,
        //            "settle_fee_rate": "0.0015",
        //            "expire_time": 1593763200,
        //            "order_price_round": "0.1",
        //            "mark_price_round": "0.1",
        //            "leverage_min": "1",
        //            "leverage_max": "100",
        //            "maintenance_rate": "1000000",
        //            "risk_limit_base": "140.726652109199",
        //            "risk_limit_step": "1000000",
        //            "risk_limit_max": "8000000",
        //            "maker_fee_rate": "-0.00025",
        //            "taker_fee_rate": "0.00075",
        //            "ref_discount_rate": "0",
        //            "ref_rebate_rate": "0.2",
        //            "order_price_deviate": "0.5",
        //            "order_size_min": 1,
        //            "order_size_max": 1000000,
        //            "orders_limit": 50,
        //            "orderbook_id": 63,
        //            "trade_id": 26,
        //            "trade_size": 435,
        //            "position_size": 130,
        //            "config_change_time": 1593158867,
        //            "in_delisting": false
        //        }
        //    ]
        //
        return this.parseLeverageTiers (response, symbols, 'name');
    }

    parseMarketLeverageTiers (info, market: Market = undefined) {
        /**
         * @ignore
         * @method
         * @description https://www.gate.io/help/futures/perpetual/22162/instrctions-of-risk-limit
         * @param {object} info Exchange market response for 1 market
         * @param {object} market CCXT market
         */
        //
        // Perpetual swap
        //
        //    {
        //        "name": "BTC_USDT",
        //        "type": "direct",
        //        "quanto_multiplier": "0.0001",
        //        "ref_discount_rate": "0",
        //        "order_price_deviate": "0.5",
        //        "maintenance_rate": "0.005",
        //        "mark_type": "index",
        //        "last_price": "38026",
        //        "mark_price": "37985.6",
        //        "index_price": "37954.92",
        //        "funding_rate_indicative": "0.000219",
        //        "mark_price_round": "0.01",
        //        "funding_offset": 0,
        //        "in_delisting": false,
        //        "risk_limit_base": "1000000",
        //        "interest_rate": "0.0003",
        //        "order_price_round": "0.1",
        //        "order_size_min": 1,
        //        "ref_rebate_rate": "0.2",
        //        "funding_interval": 28800,
        //        "risk_limit_step": "1000000",
        //        "leverage_min": "1",
        //        "leverage_max": "100",
        //        "risk_limit_max": "8000000",
        //        "maker_fee_rate": "-0.00025",
        //        "taker_fee_rate": "0.00075",
        //        "funding_rate": "0.002053",
        //        "order_size_max": 1000000,
        //        "funding_next_apply": 1610035200,
        //        "short_users": 977,
        //        "config_change_time": 1609899548,
        //        "trade_size": 28530850594,
        //        "position_size": 5223816,
        //        "long_users": 455,
        //        "funding_impact_value": "60000",
        //        "orders_limit": 50,
        //        "trade_id": 10851092,
        //        "orderbook_id": 2129638396
        //    }
        //
        // Delivery Futures
        //
        //    {
        //        "name": "BTC_USDT_20200814",
        //        "underlying": "BTC_USDT",
        //        "cycle": "WEEKLY",
        //        "type": "direct",
        //        "quanto_multiplier": "0.0001",
        //        "mark_type": "index",
        //        "last_price": "9017",
        //        "mark_price": "9019",
        //        "index_price": "9005.3",
        //        "basis_rate": "0.185095",
        //        "basis_value": "13.7",
        //        "basis_impact_value": "100000",
        //        "settle_price": "0",
        //        "settle_price_interval": 60,
        //        "settle_price_duration": 1800,
        //        "settle_fee_rate": "0.0015",
        //        "expire_time": 1593763200,
        //        "order_price_round": "0.1",
        //        "mark_price_round": "0.1",
        //        "leverage_min": "1",
        //        "leverage_max": "100",
        //        "maintenance_rate": "1000000",
        //        "risk_limit_base": "140.726652109199",
        //        "risk_limit_step": "1000000",
        //        "risk_limit_max": "8000000",
        //        "maker_fee_rate": "-0.00025",
        //        "taker_fee_rate": "0.00075",
        //        "ref_discount_rate": "0",
        //        "ref_rebate_rate": "0.2",
        //        "order_price_deviate": "0.5",
        //        "order_size_min": 1,
        //        "order_size_max": 1000000,
        //        "orders_limit": 50,
        //        "orderbook_id": 63,
        //        "trade_id": 26,
        //        "trade_size": 435,
        //        "position_size": 130,
        //        "config_change_time": 1593158867,
        //        "in_delisting": false
        //    }
        //
        const maintenanceMarginUnit = this.safeString (info, 'maintenance_rate'); // '0.005',
        const leverageMax = this.safeString (info, 'leverage_max'); // '100',
        const riskLimitStep = this.safeString (info, 'risk_limit_step'); // '1000000',
        const riskLimitMax = this.safeString (info, 'risk_limit_max'); // '16000000',
        const initialMarginUnit = Precise.stringDiv ('1', leverageMax);
        let maintenanceMarginRate = maintenanceMarginUnit;
        let initialMarginRatio = initialMarginUnit;
        let floor = '0';
        const tiers = [];
        while (Precise.stringLt (floor, riskLimitMax)) {
            const cap = Precise.stringAdd (floor, riskLimitStep);
            tiers.push ({
                'tier': this.parseNumber (Precise.stringDiv (cap, riskLimitStep)),
                'currency': this.safeString (market, 'settle'),
                'minNotional': this.parseNumber (floor),
                'maxNotional': this.parseNumber (cap),
                'maintenanceMarginRate': this.parseNumber (maintenanceMarginRate),
                'maxLeverage': this.parseNumber (Precise.stringDiv ('1', initialMarginRatio)),
                'info': info,
            });
            maintenanceMarginRate = Precise.stringAdd (maintenanceMarginRate, maintenanceMarginUnit);
            initialMarginRatio = Precise.stringAdd (initialMarginRatio, initialMarginUnit);
            floor = cap;
        }
        return tiers;
    }

    async repayMargin (code: string, amount, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name gate#repayMargin
         * @description repay borrowed margin and interest
         * @see https://www.gate.io/docs/apiv4/en/#repay-cross-margin-loan
         * @see https://www.gate.io/docs/apiv4/en/#repay-a-loan
         * @param {string} code unified currency code of the currency to repay
         * @param {float} amount the amount to repay
         * @param {string} symbol unified market symbol, required for isolated margin
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.mode] 'all' or 'partial' payment mode, extra parameter required for isolated margin
         * @param {string} [params.id] '34267567' loan id, extra parameter required for isolated margin
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        let marginMode = undefined;
        [ marginMode, params ] = this.handleOptionAndParams (params, 'repayMargin', 'marginMode');
        this.checkRequiredArgument ('repayMargin', marginMode, 'marginMode', [ 'cross', 'isolated' ]);
        this.checkRequiredMarginArgument ('repayMargin', symbol, marginMode);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'].toUpperCase (),
            'amount': this.currencyToPrecision (code, amount),
        };
        let response = undefined;
        if ((marginMode === 'cross') && (symbol === undefined)) {
            response = await this.privateMarginPostCrossRepayments (this.extend (request, params));
        } else if ((marginMode === 'isolated') || (symbol !== undefined)) {
            if (symbol === undefined) {
                throw new BadRequest (this.id + ' repayMargin() requires a symbol argument for isolated margin');
            }
            const market = this.market (symbol);
            request['currency_pair'] = market['id'];
            request['type'] = 'repay';
            response = await this.privateMarginPostUniLoans (this.extend (request, params));
        }
        //
        // Cross
        //
        //     [
        //         {
        //             "id": "17",
        //             "create_time": 1620381696159,
        //             "update_time": 1620381696159,
        //             "currency": "EOS",
        //             "amount": "110.553635",
        //             "text": "web",
        //             "status": 2,
        //             "repaid": "110.506649705159",
        //             "repaid_interest": "0.046985294841",
        //             "unpaid_interest": "0.0000074393366667"
        //         }
        //     ]
        //
        // Isolated
        //
        //     {
        //         "id": "34267567",
        //         "create_time": "1656394778",
        //         "expire_time": "1657258778",
        //         "status": "finished",
        //         "side": "borrow",
        //         "currency": "USDT",
        //         "rate": "0.0002",
        //         "amount": "100",
        //         "days": 10,
        //         "auto_renew": false,
        //         "currency_pair": "LTC_USDT",
        //         "left": "0",
        //         "repaid": "100",
        //         "paid_interest": "0.003333333333",
        //         "unpaid_interest": "0"
        //     }
        //
        if (marginMode === 'cross') {
            response = response[0];
        }
        return this.parseMarginLoan (response, currency);
    }

    async borrowMargin (code: string, amount, symbol: Str = undefined, params = {}) {
        /**
         * @method
         * @name gate#borrowMargin
         * @description create a loan to borrow margin
         * @see https://www.gate.io/docs/apiv4/en/#create-a-cross-margin-borrow-loan
         * @see https://www.gate.io/docs/developers/apiv4/en/#marginuni
         * @param {string} code unified currency code of the currency to borrow
         * @param {float} amount the amount to borrow
         * @param {string} symbol unified market symbol, required for isolated margin
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {string} [params.rate] '0.0002' or '0.002' extra parameter required for isolated margin
         * @returns {object} a [margin loan structure]{@link https://docs.ccxt.com/#/?id=margin-loan-structure}
         */
        let marginMode = undefined;
        [ marginMode, params ] = this.handleOptionAndParams (params, 'borrowMargin', 'marginMode');
        this.checkRequiredArgument ('borrowMargin', marginMode, 'marginMode', [ 'cross', 'isolated' ]);
        this.checkRequiredMarginArgument ('borrowMargin', symbol, marginMode);
        await this.loadMarkets ();
        const currency = this.currency (code);
        const request = {
            'currency': currency['id'].toUpperCase (),
            'amount': this.currencyToPrecision (code, amount),
        };
        let response = undefined;
        if ((marginMode === 'cross') && (symbol === undefined)) {
            response = await this.privateMarginPostCrossLoans (this.extend (request, params));
        } else if ((marginMode === 'isolated') || (symbol !== undefined)) {
            if (symbol === undefined) {
                throw new BadRequest (this.id + ' borrowMargin() requires a symbol argument for isolated margin');
            }
            const market = this.market (symbol);
            request['currency_pair'] = market['id'];
            request['type'] = 'borrow';
            response = await this.privateMarginPostUniLoans (this.extend (request, params));
        }
        //
        // Cross
        //
        //     {
        //         "id": "17",
        //         "create_time": 1620381696159,
        //         "update_time": 1620381696159,
        //         "currency": "EOS",
        //         "amount": "110.553635",
        //         "text": "web",
        //         "status": 2,
        //         "repaid": "110.506649705159",
        //         "repaid_interest": "0.046985294841",
        //         "unpaid_interest": "0.0000074393366667"
        //     }
        //
        // Isolated
        //
        //     {
        //         "id": "34267567",
        //         "create_time": "1656394778",
        //         "expire_time": "1657258778",
        //         "status": "loaned",
        //         "side": "borrow",
        //         "currency": "USDT",
        //         "rate": "0.0002",
        //         "amount": "100",
        //         "days": 10,
        //         "auto_renew": false,
        //         "currency_pair": "LTC_USDT",
        //         "left": "0",
        //         "repaid": "0",
        //         "paid_interest": "0",
        //         "unpaid_interest": "0.003333333333"
        //     }
        //
        return this.parseMarginLoan (response, currency);
    }

    parseMarginLoan (info, currency: Currency = undefined) {
        //
        // Cross
        //
        //     {
        //         "id": "17",
        //         "create_time": 1620381696159,
        //         "update_time": 1620381696159,
        //         "currency": "EOS",
        //         "amount": "110.553635",
        //         "text": "web",
        //         "status": 2,
        //         "repaid": "110.506649705159",
        //         "repaid_interest": "0.046985294841",
        //         "unpaid_interest": "0.0000074393366667"
        //     }
        //
        // Isolated
        //
        //     {
        //         "id": "34267567",
        //         "create_time": "1656394778",
        //         "expire_time": "1657258778",
        //         "status": "loaned",
        //         "side": "borrow",
        //         "currency": "USDT",
        //         "rate": "0.0002",
        //         "amount": "100",
        //         "days": 10,
        //         "auto_renew": false,
        //         "currency_pair": "LTC_USDT",
        //         "left": "0",
        //         "repaid": "0",
        //         "paid_interest": "0",
        //         "unpaid_interest": "0.003333333333"
        //     }
        //
        const marginMode = this.safeString2 (this.options, 'defaultMarginMode', 'marginMode', 'cross');
        let timestamp = this.safeInteger (info, 'create_time');
        if (marginMode === 'isolated') {
            timestamp = this.safeTimestamp (info, 'create_time');
        }
        const currencyId = this.safeString (info, 'currency');
        const marketId = this.safeString (info, 'currency_pair');
        return {
            'id': this.safeInteger (info, 'id'),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.safeNumber (info, 'amount'),
            'symbol': this.safeSymbol (marketId, undefined, '_', 'margin'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': info,
        };
    }

    sign (path, api = [], method = 'GET', params = {}, headers = undefined, body = undefined) {
        const authentication = api[0]; // public, private
        const type = api[1]; // spot, margin, future, delivery
        let query = this.omit (params, this.extractParams (path));
        if (Array.isArray (params)) {
            // endpoints like createOrders use an array instead of an object
            // so we infer the settle from one of the elements
            // they have to be all the same so relying on the first one is fine
            const first = this.safeValue (params, 0, {});
            path = this.implodeParams (path, first);
        } else {
            path = this.implodeParams (path, params);
        }
        const endPart = (path === '') ? '' : ('/' + path);
        let entirePath = '/' + type + endPart;
        if ((type === 'subAccounts') || (type === 'withdrawals')) {
            entirePath = endPart;
        }
        let url = this.urls['api'][authentication][type];
        if (url === undefined) {
            throw new NotSupported (this.id + ' does not have a testnet for the ' + type + ' market type.');
        }
        url += entirePath;
        if (authentication === 'public') {
            if (Object.keys (query).length) {
                url += '?' + this.urlencode (query);
            }
        } else {
            this.checkRequiredCredentials ();
            let queryString = '';
            let requiresURLEncoding = false;
            if (((type === 'futures') || (type === 'delivery')) && method === 'POST') {
                const pathParts = path.split ('/');
                const secondPart = this.safeString (pathParts, 1, '');
                requiresURLEncoding = (secondPart.indexOf ('dual') >= 0) || (secondPart.indexOf ('positions') >= 0);
            }
            if ((method === 'GET') || (method === 'DELETE') || requiresURLEncoding || (method === 'PATCH')) {
                if (Object.keys (query).length) {
                    queryString = this.urlencode (query);
                    url += '?' + queryString;
                }
                if (method === 'PATCH') {
                    body = this.json (query);
                }
            } else {
                const urlQueryParams = this.safeValue (query, 'query', {});
                if (Object.keys (urlQueryParams).length) {
                    queryString = this.urlencode (urlQueryParams);
                    url += '?' + queryString;
                }
                query = this.omit (query, 'query');
                body = this.json (query);
            }
            const bodyPayload = (body === undefined) ? '' : body;
            const bodySignature = this.hash (this.encode (bodyPayload), sha512);
            const timestamp = this.seconds ();
            const timestampString = timestamp.toString ();
            const signaturePath = '/api/' + this.version + entirePath;
            const payloadArray = [ method.toUpperCase (), signaturePath, queryString, bodySignature, timestampString ];
            // eslint-disable-next-line quotes
            const payload = payloadArray.join ("\n");
            const signature = this.hmac (this.encode (payload), this.encode (this.secret), sha512);
            headers = {
                'KEY': this.apiKey,
                'Timestamp': timestampString,
                'SIGN': signature,
                'Content-Type': 'application/json',
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    async modifyMarginHelper (symbol: string, amount, params = {}) {
        await this.loadMarkets ();
        const market = this.market (symbol);
        const [ request, query ] = this.prepareRequest (market, undefined, params);
        request['change'] = this.numberToString (amount);
        const method = this.getSupportedMapping (market['type'], {
            'swap': 'privateFuturesPostSettlePositionsContractMargin',
            'future': 'privateDeliveryPostSettlePositionsContractMargin',
        });
        const response = await this[method] (this.extend (request, query));
        return this.parseMarginModification (response, market);
    }

    parseMarginModification (data, market: Market = undefined) {
        //
        //     {
        //         "value": "11.9257",
        //         "leverage": "5",
        //         "mode": "single",
        //         "realised_point": "0",
        //         "contract": "ETH_USDT",
        //         "entry_price": "1203.45",
        //         "mark_price": "1192.57",
        //         "history_point": "0",
        //         "realised_pnl": "-0.00577656",
        //         "close_order": null,
        //         "size": "1",
        //         "cross_leverage_limit": "0",
        //         "pending_orders": "0",
        //         "adl_ranking": "5",
        //         "maintenance_rate": "0.005",
        //         "unrealised_pnl": "-0.1088",
        //         "user": "1486602",
        //         "leverage_max": "100",
        //         "history_pnl": "0",
        //         "risk_limit": "1000000",
        //         "margin": "5.415925875",
        //         "last_close_pnl": "0",
        //         "liq_price": "665.69"
        //     }
        //
        const contract = this.safeString (data, 'contract');
        market = this.safeMarket (contract, market, '_', 'contract');
        const total = this.safeNumber (data, 'margin');
        return {
            'info': data,
            'amount': undefined,
            'code': this.safeValue (market, 'quote'),
            'symbol': market['symbol'],
            'total': total,
            'status': 'ok',
        };
    }

    async reduceMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name gate#reduceMargin
         * @description remove margin from a position
         * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-margin
         * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-margin-2
         * @param {string} symbol unified market symbol
         * @param {float} amount the amount of margin to remove
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=reduce-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, -amount, params);
    }

    async addMargin (symbol: string, amount, params = {}) {
        /**
         * @method
         * @name gate#addMargin
         * @description add margin
         * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-margin
         * @see https://www.gate.io/docs/developers/apiv4/en/#update-position-margin-2
         * @param {string} symbol unified market symbol
         * @param {float} amount amount of margin to add
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [margin structure]{@link https://docs.ccxt.com/#/?id=add-margin-structure}
         */
        return await this.modifyMarginHelper (symbol, amount, params);
    }

    async fetchOpenInterestHistory (symbol: string, timeframe = '5m', since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchOpenInterest
         * @description Retrieves the open interest of a currency
         * @see https://www.gate.io/docs/developers/apiv4/en/#futures-stats
         * @param {string} symbol Unified CCXT market symbol
         * @param {string} timeframe "5m", "15m", "30m", "1h", "4h", "1d"
         * @param {int} [since] the time(ms) of the earliest record to retrieve as a unix timestamp
         * @param {int} [limit] default 30
         * @param {object} [params] exchange specific parameters
         * @returns {object} an open interest structure{@link https://docs.ccxt.com/#/?id=open-interest-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchOpenInterestHistory', 'paginate', false);
        if (paginate) {
            return await this.fetchPaginatedCallDeterministic ('fetchOpenInterestHistory', symbol, since, limit, timeframe, params, 100) as OpenInterest[];
        }
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new BadRequest (this.id + ' fetchOpenInterest() supports swap markets only');
        }
        const request = {
            'contract': market['id'],
            'settle': market['settleId'],
            'interval': this.safeString (this.timeframes, timeframe, timeframe),
        };
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        const response = await this.publicFuturesGetSettleContractStats (this.extend (request, params));
        //
        //    [
        //        {
        //            "long_liq_size": "0",
        //            "short_liq_size": "0",
        //            "short_liq_usd": "0",
        //            "lsr_account": "3.2808988764045",
        //            "mark_price": "0.34619",
        //            "top_lsr_size": "0",
        //            "time": "1674057000",
        //            "short_liq_amount": "0",
        //            "long_liq_amount": "0",
        //            "open_interest_usd": "9872386.7775",
        //            "top_lsr_account": "0",
        //            "open_interest": "2851725",
        //            "long_liq_usd": "0",
        //            "lsr_taker": "9.3765153315902"
        //        },
        //        ...
        //    ]
        //
        return this.parseOpenInterests (response, market, since, limit);
    }

    parseOpenInterest (interest, market: Market = undefined) {
        //
        //    {
        //        "long_liq_size": "0",
        //        "short_liq_size": "0",
        //        "short_liq_usd": "0",
        //        "lsr_account": "3.2808988764045",
        //        "mark_price": "0.34619",
        //        "top_lsr_size": "0",
        //        "time": "1674057000",
        //        "short_liq_amount": "0",
        //        "long_liq_amount": "0",
        //        "open_interest_usd": "9872386.7775",
        //        "top_lsr_account": "0",
        //        "open_interest": "2851725",
        //        "long_liq_usd": "0",
        //        "lsr_taker": "9.3765153315902"
        //    }
        //
        const timestamp = this.safeTimestamp (interest, 'time');
        return {
            'symbol': this.safeString (market, 'symbol'),
            'openInterestAmount': this.safeNumber (interest, 'open_interest'),
            'openInterestValue': this.safeNumber (interest, 'open_interest_usd'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'info': interest,
        };
    }

    async fetchSettlementHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchSettlementHistory
         * @description fetches historical settlement records
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-settlement-history-2
         * @param {string} symbol unified market symbol of the settlement history, required on gate
         * @param {int} [since] timestamp in ms
         * @param {int} [limit] number of records
         * @param {object} [params] exchange specific params
         * @returns {object[]} a list of [settlement history objects]{@link https://docs.ccxt.com/#/?id=settlement-history-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchSettlementHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchSettlementHistory', market, params);
        if (type !== 'option') {
            throw new NotSupported (this.id + ' fetchSettlementHistory() supports option markets only');
        }
        const marketId = market['id'];
        const optionParts = marketId.split ('-');
        const request = {
            'underlying': this.safeString (optionParts, 0),
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.publicOptionsGetSettlements (this.extend (request, params));
        //
        //     [
        //         {
        //             "time": 1685952000,
        //             "profit": "18.266806892718",
        //             "settle_price": "26826.68068927182",
        //             "fee": "0.040240021034",
        //             "contract": "BTC_USDT-20230605-25000-C",
        //             "strike_price": "25000"
        //         }
        //     ]
        //
        const settlements = this.parseSettlements (response, market);
        const sorted = this.sortBy (settlements, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, symbol, since, limit);
    }

    async fetchMySettlementHistory (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchMySettlementHistory
         * @description fetches historical settlement records of the user
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-my-options-settlements
         * @param {string} symbol unified market symbol of the settlement history
         * @param {int} [since] timestamp in ms
         * @param {int} [limit] number of records
         * @param {object} [params] exchange specific params
         * @returns {object[]} a list of [settlement history objects]
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMySettlementHistory() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        let type = undefined;
        [ type, params ] = this.handleMarketTypeAndParams ('fetchMySettlementHistory', market, params);
        if (type !== 'option') {
            throw new NotSupported (this.id + ' fetchMySettlementHistory() supports option markets only');
        }
        const marketId = market['id'];
        const optionParts = marketId.split ('-');
        const request = {
            'underlying': this.safeString (optionParts, 0),
            'contract': marketId,
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        const response = await this.privateOptionsGetMySettlements (this.extend (request, params));
        //
        //     [
        //         {
        //             "size": -1,
        //             "settle_profit": "0",
        //             "contract": "BTC_USDT-20220624-26000-C",
        //             "strike_price": "26000",
        //             "time": 1656057600,
        //             "settle_price": "20917.461281337048",
        //             "underlying": "BTC_USDT",
        //             "realised_pnl": "-0.00116042",
        //             "fee": "0"
        //         }
        //     ]
        //
        const result = this.safeValue (response, 'result', {});
        const data = this.safeValue (result, 'list', []);
        const settlements = this.parseSettlements (data, market);
        const sorted = this.sortBy (settlements, 'timestamp');
        return this.filterBySymbolSinceLimit (sorted, market['symbol'], since, limit);
    }

    parseSettlement (settlement, market) {
        //
        // fetchSettlementHistory
        //
        //     {
        //         "time": 1685952000,
        //         "profit": "18.266806892718",
        //         "settle_price": "26826.68068927182",
        //         "fee": "0.040240021034",
        //         "contract": "BTC_USDT-20230605-25000-C",
        //         "strike_price": "25000"
        //     }
        //
        // fetchMySettlementHistory
        //
        //     {
        //         "size": -1,
        //         "settle_profit": "0",
        //         "contract": "BTC_USDT-20220624-26000-C",
        //         "strike_price": "26000",
        //         "time": 1656057600,
        //         "settle_price": "20917.461281337048",
        //         "underlying": "BTC_USDT",
        //         "realised_pnl": "-0.00116042",
        //         "fee": "0"
        //     }
        //
        const timestamp = this.safeTimestamp (settlement, 'time');
        const marketId = this.safeString (settlement, 'contract');
        return {
            'info': settlement,
            'symbol': this.safeSymbol (marketId, market),
            'price': this.safeNumber (settlement, 'settle_price'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        };
    }

    parseSettlements (settlements, market) {
        //
        // fetchSettlementHistory
        //
        //     [
        //         {
        //             "time": 1685952000,
        //             "profit": "18.266806892718",
        //             "settle_price": "26826.68068927182",
        //             "fee": "0.040240021034",
        //             "contract": "BTC_USDT-20230605-25000-C",
        //             "strike_price": "25000"
        //         }
        //     ]
        //
        // fetchMySettlementHistory
        //
        //     [
        //         {
        //             "size": -1,
        //             "settle_profit": "0",
        //             "contract": "BTC_USDT-20220624-26000-C",
        //             "strike_price": "26000",
        //             "time": 1656057600,
        //             "settle_price": "20917.461281337048",
        //             "underlying": "BTC_USDT",
        //             "realised_pnl": "-0.00116042",
        //             "fee": "0"
        //         }
        //     ]
        //
        const result = [];
        for (let i = 0; i < settlements.length; i++) {
            result.push (this.parseSettlement (settlements[i], market));
        }
        return result;
    }

    async fetchLedger (code: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchLedger
         * @description fetch the history of changes, actions done by the user or operations that altered the balance of the user
         * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-margin-account-balance-change-history
         * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#query-account-book-3
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-account-changing-history
         * @param {string} code unified currency code
         * @param {int} [since] timestamp in ms of the earliest ledger entry
         * @param {int} [limit] max number of ledger entries to return
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @param {int} [params.until] end time in ms
         * @param {boolean} [params.paginate] default false, when true will automatically paginate by calling this endpoint multiple times. See in the docs all the [availble parameters](https://github.com/ccxt/ccxt/wiki/Manual#pagination-params)
         * @returns {object} a [ledger structure]{@link https://docs.ccxt.com/#/?id=ledger-structure}
         */
        await this.loadMarkets ();
        let paginate = false;
        [ paginate, params ] = this.handleOptionAndParams (params, 'fetchLedger', 'paginate');
        if (paginate) {
            return await this.fetchPaginatedCallDynamic ('fetchLedger', code, since, limit, params);
        }
        let type = undefined;
        let currency = undefined;
        let response = undefined;
        let request = {};
        [ type, params ] = this.handleMarketTypeAndParams ('fetchLedger', undefined, params);
        if ((type === 'spot') || (type === 'margin')) {
            if (code !== undefined) {
                currency = this.currency (code);
                request['currency'] = currency['id'];
            }
        }
        if ((type === 'swap') || (type === 'future')) {
            const defaultSettle = (type === 'swap') ? 'usdt' : 'btc';
            const settle = this.safeStringLower (params, 'settle', defaultSettle);
            params = this.omit (params, 'settle');
            request['settle'] = settle;
        }
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('to', request, params);
        if (type === 'spot') {
            response = await this.privateSpotGetAccountBook (this.extend (request, params));
        } else if (type === 'margin') {
            response = await this.privateMarginGetAccountBook (this.extend (request, params));
        } else if (type === 'swap') {
            response = await this.privateFuturesGetSettleAccountBook (this.extend (request, params));
        } else if (type === 'future') {
            response = await this.privateDeliveryGetSettleAccountBook (this.extend (request, params));
        } else if (type === 'option') {
            response = await this.privateOptionsGetAccountBook (this.extend (request, params));
        }
        //
        // spot
        //
        //     [
        //         {
        //             "id": "123456",
        //             "time": 1547633726123,
        //             "currency": "BTC",
        //             "change": "1.03",
        //             "balance": "4.59316525194",
        //             "type": "margin_in"
        //         }
        //     ]
        //
        // margin
        //
        //     [
        //         {
        //             "id": "123456",
        //             "time": "1547633726",
        //             "time_ms": 1547633726123,
        //             "currency": "BTC",
        //             "currency_pair": "BTC_USDT",
        //             "change": "1.03",
        //             "balance": "4.59316525194"
        //         }
        //     ]
        //
        // swap and future
        //
        //     [
        //         {
        //             "time": 1682294400.123456,
        //             "change": "0.000010152188",
        //             "balance": "4.59316525194",
        //             "text": "ETH_USD:6086261",
        //             "type": "fee"
        //         }
        //     ]
        //
        // option
        //
        //     [
        //         {
        //             "time": 1685594770,
        //             "change": "3.33",
        //             "balance": "29.87911771",
        //             "text": "BTC_USDT-20230602-26500-C:2611026125",
        //             "type": "prem"
        //         }
        //     ]
        //
        return this.parseLedger (response, currency, since, limit);
    }

    parseLedgerEntry (item, currency: Currency = undefined) {
        //
        // spot
        //
        //     {
        //         "id": "123456",
        //         "time": 1547633726123,
        //         "currency": "BTC",
        //         "change": "1.03",
        //         "balance": "4.59316525194",
        //         "type": "margin_in"
        //     }
        //
        // margin
        //
        //     {
        //         "id": "123456",
        //         "time": "1547633726",
        //         "time_ms": 1547633726123,
        //         "currency": "BTC",
        //         "currency_pair": "BTC_USDT",
        //         "change": "1.03",
        //         "balance": "4.59316525194"
        //     }
        //
        // swap and future
        //
        //     {
        //         "time": 1682294400.123456,
        //         "change": "0.000010152188",
        //         "balance": "4.59316525194",
        //         "text": "ETH_USD:6086261",
        //         "type": "fee"
        //     }
        //
        // option
        //
        //     {
        //         "time": 1685594770,
        //         "change": "3.33",
        //         "balance": "29.87911771",
        //         "text": "BTC_USDT-20230602-26500-C:2611026125",
        //         "type": "prem"
        //     }
        //
        let direction = undefined;
        let amount = this.safeString (item, 'change');
        if (Precise.stringLt (amount, '0')) {
            direction = 'out';
            amount = Precise.stringAbs (amount);
        } else {
            direction = 'in';
        }
        const currencyId = this.safeString (item, 'currency');
        const type = this.safeString (item, 'type');
        const rawTimestamp = this.safeString (item, 'time');
        let timestamp = undefined;
        if (rawTimestamp.length > 10) {
            timestamp = parseInt (rawTimestamp);
        } else {
            timestamp = parseInt (rawTimestamp) * 1000;
        }
        const balanceString = this.safeString (item, 'balance');
        const changeString = this.safeString (item, 'change');
        const before = this.parseNumber (Precise.stringSub (balanceString, changeString));
        return {
            'id': this.safeString (item, 'id'),
            'direction': direction,
            'account': undefined,
            'referenceAccount': undefined,
            'referenceId': undefined,
            'type': this.parseLedgerEntryType (type),
            'currency': this.safeCurrencyCode (currencyId, currency),
            'amount': this.parseNumber (amount),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'before': before,
            'after': this.safeNumber (item, 'balance'),
            'status': undefined,
            'fee': undefined,
            'info': item,
        };
    }

    parseLedgerEntryType (type) {
        const ledgerType = {
            'deposit': 'deposit',
            'withdraw': 'withdrawal',
            'sub_account_transfer': 'transfer',
            'margin_in': 'transfer',
            'margin_out': 'transfer',
            'margin_funding_in': 'transfer',
            'margin_funding_out': 'transfer',
            'cross_margin_in': 'transfer',
            'cross_margin_out': 'transfer',
            'copy_trading_in': 'transfer',
            'copy_trading_out': 'transfer',
            'quant_in': 'transfer',
            'quant_out': 'transfer',
            'futures_in': 'transfer',
            'futures_out': 'transfer',
            'delivery_in': 'transfer',
            'delivery_out': 'transfer',
            'new_order': 'trade',
            'order_fill': 'trade',
            'referral_fee': 'rebate',
            'order_fee': 'fee',
            'interest': 'interest',
            'lend': 'loan',
            'redeem': 'loan',
            'profit': 'interest',
            'flash_swap_buy': 'trade',
            'flash_swap_sell': 'trade',
            'unknown': 'unknown',
            'set': 'settlement',
            'prem': 'trade',
            'point_refr': 'rebate',
            'point_fee': 'fee',
            'point_dnw': 'deposit/withdraw',
            'fund': 'fee',
            'refr': 'rebate',
            'fee': 'fee',
            'pnl': 'trade',
            'dnw': 'deposit/withdraw',
        };
        return this.safeString (ledgerType, type, type);
    }

    async setPositionMode (hedged, symbol = undefined, params = {}) {
        /**
         * @method
         * @name gate#setPositionMode
         * @description set dual/hedged mode to true or false for a swap market, make sure all positions are closed and no orders are open before setting dual mode
         * @see https://www.gate.io/docs/developers/apiv4/en/#enable-or-disable-dual-mode
         * @param {bool} hedged set to true to enable dual mode
         * @param {string|undefined} symbol if passed, dual mode is set for all markets with the same settle currency
         * @param {object} params extra parameters specific to the exchange API endpoint
         * @param {string} params.settle settle currency
         * @returns {object} response from the exchange
         */
        const market = (symbol !== undefined) ? this.market (symbol) : undefined;
        const [ request, query ] = this.prepareRequest (market, 'swap', params);
        request['dual_mode'] = hedged;
        return await this.privateFuturesPostSettleDualMode (this.extend (request, query));
    }

    async fetchUnderlyingAssets (params = {}) {
        /**
         * @method
         * @name gate#fetchUnderlyingAssets
         * @description fetches the market ids of underlying assets for a specific contract market type
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-all-underlyings
         * @param {object} [params] exchange specific params
         * @param {string} [params.type] the contract market type, 'option', 'swap' or 'future', the default is 'option'
         * @returns {object[]} a list of [underlying assets]{@link https://docs.ccxt.com/#/?id=underlying-assets-structure}
         */
        await this.loadMarkets ();
        let marketType = undefined;
        [ marketType, params ] = this.handleMarketTypeAndParams ('fetchUnderlyingAssets', undefined, params);
        if ((marketType === undefined) || (marketType === 'spot')) {
            marketType = 'option';
        }
        if (marketType !== 'option') {
            throw new NotSupported (this.id + ' fetchUnderlyingAssets() supports option markets only');
        }
        const response = await this.publicOptionsGetUnderlyings (params);
        //
        //    [
        //        {
        //            "index_time": "1646915796",
        //            "name": "BTC_USDT",
        //            "index_price": "39142.73"
        //        }
        //    ]
        //
        const underlyings = [];
        for (let i = 0; i < response.length; i++) {
            const underlying = response[i];
            const name = this.safeString (underlying, 'name');
            if (name !== undefined) {
                underlyings.push (name);
            }
        }
        return underlyings;
    }

    async fetchLiquidations (symbol: string, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchLiquidations
         * @description retrieves the public liquidations of a trading pair
         * @see https://www.gate.io/docs/developers/apiv4/en/#retrieve-liquidation-history
         * @param {string} symbol unified CCXT market symbol
         * @param {int} [since] the earliest time in ms to fetch liquidations for
         * @param {int} [limit] the maximum number of liquidation structures to retrieve
         * @param {object} [params] exchange specific parameters for the exchange API endpoint
         * @param {int} [params.until] timestamp in ms of the latest liquidation
         * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        if (!market['swap']) {
            throw new NotSupported (this.id + ' fetchLiquidations() supports swap markets only');
        }
        let request = {
            'settle': market['settleId'],
            'contract': market['id'],
        };
        if (since !== undefined) {
            request['from'] = since;
        }
        if (limit !== undefined) {
            request['limit'] = limit;
        }
        [ request, params ] = this.handleUntilOption ('to', request, params);
        const response = await this.publicFuturesGetSettleLiqOrders (this.extend (request, params));
        //
        //     [
        //         {
        //             "contract": "BTC_USDT",
        //             "left": 0,
        //             "size": -165,
        //             "fill_price": "28070",
        //             "order_price": "28225",
        //             "time": 1696736132
        //         },
        //     ]
        //
        return this.parseLiquidations (response, market, since, limit);
    }

    async fetchMyLiquidations (symbol: Str = undefined, since: Int = undefined, limit: Int = undefined, params = {}) {
        /**
         * @method
         * @name gate#fetchMyLiquidations
         * @description retrieves the users liquidated positions
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-liquidation-history
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-liquidation-history-2
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-user-s-liquidation-history-of-specified-underlying
         * @param {string} symbol unified CCXT market symbol
         * @param {int} [since] the earliest time in ms to fetch liquidations for
         * @param {int} [limit] the maximum number of liquidation structures to retrieve
         * @param {object} [params] exchange specific parameters for the exchange API endpoint
         * @returns {object} an array of [liquidation structures]{@link https://docs.ccxt.com/#/?id=liquidation-structure}
         */
        if (symbol === undefined) {
            throw new ArgumentsRequired (this.id + ' fetchMyLiquidations() requires a symbol argument');
        }
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'contract': market['id'],
        };
        let response = undefined;
        if ((market['swap']) || (market['future'])) {
            if (limit !== undefined) {
                request['limit'] = limit;
            }
            request['settle'] = market['settleId'];
        } else if (market['option']) {
            const marketId = market['id'];
            const optionParts = marketId.split ('-');
            request['underlying'] = this.safeString (optionParts, 0);
        }
        if (market['swap']) {
            response = await this.privateFuturesGetSettleLiquidates (this.extend (request, params));
        } else if (market['future']) {
            response = await this.privateDeliveryGetSettleLiquidates (this.extend (request, params));
        } else if (market['option']) {
            response = await this.privateOptionsGetPositionClose (this.extend (request, params));
        } else {
            throw new NotSupported (this.id + ' fetchMyLiquidations() does not support ' + market['type'] + ' orders');
        }
        //
        // swap and future
        //
        //     [
        //         {
        //             "time": 1548654951,
        //             "contract": "BTC_USDT",
        //             "size": 600,
        //             "leverage": "25",
        //             "margin": "0.006705256878",
        //             "entry_price": "3536.123",
        //             "liq_price": "3421.54",
        //             "mark_price": "3420.27",
        //             "order_id": 317393847,
        //             "order_price": "3405",
        //             "fill_price": "3424",
        //             "left": 0
        //         }
        //     ]
        //
        // option
        //
        //     [
        //         {
        //             "time": 1631764800,
        //             "pnl": "-42914.291",
        //             "settle_size": "-10001",
        //             "side": "short",
        //             "contract": "BTC_USDT-20210916-5000-C",
        //             "text": "settled"
        //         }
        //     ]
        //
        return this.parseLiquidations (response, market, since, limit);
    }

    parseLiquidation (liquidation, market: Market = undefined) {
        //
        // fetchLiquidations
        //
        //     {
        //         "contract": "BTC_USDT",
        //         "left": 0,
        //         "size": -165,
        //         "fill_price": "28070",
        //         "order_price": "28225",
        //         "time": 1696736132
        //     }
        //
        // swap and future: fetchMyLiquidations
        //
        //     {
        //         "time": 1548654951,
        //         "contract": "BTC_USDT",
        //         "size": 600,
        //         "leverage": "25",
        //         "margin": "0.006705256878",
        //         "entry_price": "3536.123",
        //         "liq_price": "3421.54",
        //         "mark_price": "3420.27",
        //         "order_id": 317393847,
        //         "order_price": "3405",
        //         "fill_price": "3424",
        //         "left": 0
        //     }
        //
        // option: fetchMyLiquidations
        //
        //     {
        //         "time": 1631764800,
        //         "pnl": "-42914.291",
        //         "settle_size": "-10001",
        //         "side": "short",
        //         "contract": "BTC_USDT-20210916-5000-C",
        //         "text": "settled"
        //     }
        //
        const marketId = this.safeString (liquidation, 'contract');
        const timestamp = this.safeTimestamp (liquidation, 'time');
        const size = this.safeString2 (liquidation, 'size', 'settle_size');
        const left = this.safeString (liquidation, 'left', '0');
        const contractsString = Precise.stringAbs (Precise.stringSub (size, left));
        const contractSizeString = this.safeString (market, 'contractSize');
        const priceString = this.safeString2 (liquidation, 'liq_price', 'fill_price');
        const baseValueString = Precise.stringMul (contractsString, contractSizeString);
        let quoteValueString = this.safeString (liquidation, 'pnl');
        if (quoteValueString === undefined) {
            quoteValueString = Precise.stringMul (baseValueString, priceString);
        }
        return this.safeLiquidation ({
            'info': liquidation,
            'symbol': this.safeSymbol (marketId, market),
            'contracts': this.parseNumber (contractsString),
            'contractSize': this.parseNumber (contractSizeString),
            'price': this.parseNumber (priceString),
            'baseValue': this.parseNumber (baseValueString),
            'quoteValue': this.parseNumber (Precise.stringAbs (quoteValueString)),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
        });
    }

    async fetchGreeks (symbol: string, params = {}): Promise<Greeks> {
        /**
         * @method
         * @name gate#fetchGreeks
         * @description fetches an option contracts greeks, financial metrics used to measure the factors that affect the price of an options contract
         * @see https://www.gate.io/docs/developers/apiv4/en/#list-tickers-of-options-contracts
         * @param {string} symbol unified symbol of the market to fetch greeks for
         * @param {object} [params] extra parameters specific to the exchange API endpoint
         * @returns {object} a [greeks structure]{@link https://docs.ccxt.com/#/?id=greeks-structure}
         */
        await this.loadMarkets ();
        const market = this.market (symbol);
        const request = {
            'underlying': market['info']['underlying'],
        };
        const response = await this.publicOptionsGetTickers (this.extend (request, params));
        //
        //     [
        //         {
        //             "vega": "1.78992",
        //             "leverage": "6.2096777055417",
        //             "ask_iv": "0.6245",
        //             "delta": "-0.69397",
        //             "last_price": "0",
        //             "theta": "-2.5723",
        //             "bid1_price": "222.9",
        //             "mark_iv": "0.5909",
        //             "name": "ETH_USDT-20231201-2300-P",
        //             "bid_iv": "0.5065",
        //             "ask1_price": "243.6",
        //             "mark_price": "236.57",
        //             "position_size": 0,
        //             "bid1_size": 368,
        //             "ask1_size": -335,
        //             "gamma": "0.00116"
        //         },
        //     ]
        //
        const marketId = market['id'];
        for (let i = 0; i < response.length; i++) {
            const entry = response[i];
            const entryMarketId = this.safeString (entry, 'name');
            if (entryMarketId === marketId) {
                return this.parseGreeks (entry, market);
            }
        }
    }

    parseGreeks (greeks, market: Market = undefined) {
        //
        //     {
        //         "vega": "1.78992",
        //         "leverage": "6.2096777055417",
        //         "ask_iv": "0.6245",
        //         "delta": "-0.69397",
        //         "last_price": "0",
        //         "theta": "-2.5723",
        //         "bid1_price": "222.9",
        //         "mark_iv": "0.5909",
        //         "name": "ETH_USDT-20231201-2300-P",
        //         "bid_iv": "0.5065",
        //         "ask1_price": "243.6",
        //         "mark_price": "236.57",
        //         "position_size": 0,
        //         "bid1_size": 368,
        //         "ask1_size": -335,
        //         "gamma": "0.00116"
        //     }
        //
        const marketId = this.safeString (greeks, 'name');
        const symbol = this.safeSymbol (marketId, market);
        return {
            'symbol': symbol,
            'timestamp': undefined,
            'datetime': undefined,
            'delta': this.safeNumber (greeks, 'delta'),
            'gamma': this.safeNumber (greeks, 'gamma'),
            'theta': this.safeNumber (greeks, 'theta'),
            'vega': this.safeNumber (greeks, 'vega'),
            'rho': undefined,
            'bidSize': this.safeNumber (greeks, 'bid1_size'),
            'askSize': this.safeNumber (greeks, 'ask1_size'),
            'bidImpliedVolatility': this.safeNumber (greeks, 'bid_iv'),
            'askImpliedVolatility': this.safeNumber (greeks, 'ask_iv'),
            'markImpliedVolatility': this.safeNumber (greeks, 'mark_iv'),
            'bidPrice': this.safeNumber (greeks, 'bid1_price'),
            'askPrice': this.safeNumber (greeks, 'ask1_price'),
            'markPrice': this.safeNumber (greeks, 'mark_price'),
            'lastPrice': this.safeNumber (greeks, 'last_price'),
            'underlyingPrice': this.parseNumber (market['info']['underlying_price']),
            'info': greeks,
        };
    }

    handleErrors (code, reason, url, method, headers, body, response, requestHeaders, requestBody) {
        if (response === undefined) {
            return undefined;
        }
        //
        //    {"label": "ORDER_NOT_FOUND", "message": "Order not found"}
        //    {"label": "INVALID_PARAM_VALUE", "message": "invalid argument: status"}
        //    {"label": "INVALID_PARAM_VALUE", "message": "invalid argument: Trigger.rule"}
        //    {"label": "INVALID_PARAM_VALUE", "message": "invalid argument: trigger.expiration invalid range"}
        //    {"label": "INVALID_ARGUMENT", "detail": "invalid size"}
        //
        const label = this.safeString (response, 'label');
        if (label !== undefined) {
            const feedback = this.id + ' ' + body;
            this.throwExactlyMatchedException (this.exceptions['exact'], label, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
