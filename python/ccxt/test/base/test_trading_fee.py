import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

# ----------------------------------------------------------------------------

# PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
# https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

# ----------------------------------------------------------------------------
# -*- coding: utf-8 -*-


from ccxt.test.base import test_shared_methods  # noqa E402


def test_trading_fee(exchange, skipped_properties, method, symbol, entry):
    format = {
        'info': {},
        'symbol': 'ETH/BTC',
        'maker': exchange.parse_number('0.002'),
        'taker': exchange.parse_number('0.003'),
        'percentage': False,
        'tierBased': False,
    }
    empty_allowed_for = ['tierBased', 'percentage', 'symbol']
    test_shared_methods.assert_structure(exchange, skipped_properties, method, entry, format, empty_allowed_for)
    test_shared_methods.assert_symbol(exchange, skipped_properties, method, entry, 'symbol', symbol)
