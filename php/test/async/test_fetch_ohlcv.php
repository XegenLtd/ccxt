<?php
namespace ccxt;
use \ccxt\Precise;
use React\Async;
use React\Promise;

// ----------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

// -----------------------------------------------------------------------------
include_once __DIR__ . '/../base/test_ohlcv.php';

function test_fetch_ohlcv($exchange, $skipped_properties, $symbol) {
    return Async\async(function () use ($exchange, $skipped_properties, $symbol) {
        $method = 'fetchOHLCV';
        $timeframe_keys = is_array($exchange->timeframes) ? array_keys($exchange->timeframes) : array();
        assert(count($timeframe_keys), $exchange->id . ' ' . $method . ' - no timeframes found');
        // prefer 1m timeframe if available, otherwise return the first one
        $chosen_timeframe_key = '1m';
        if (!$exchange->in_array($chosen_timeframe_key, $timeframe_keys)) {
            $chosen_timeframe_key = $timeframe_keys[0];
        }
        $limit = 10;
        $duration = $exchange->parse_timeframe($chosen_timeframe_key);
        $since = $exchange->milliseconds() - $duration * $limit * 1000 - 1000;
        $ohlcvs = Async\await($exchange->fetch_ohlcv($symbol, $chosen_timeframe_key, $since, $limit));
        assert(gettype($ohlcvs) === 'array' && array_keys($ohlcvs) === array_keys(array_keys($ohlcvs)), $exchange->id . ' ' . $method . ' must return an array, returned ' . $exchange->json($ohlcvs));
        $now = $exchange->milliseconds();
        for ($i = 0; $i < count($ohlcvs); $i++) {
            test_ohlcv($exchange, $skipped_properties, $method, $ohlcvs[$i], $symbol, $now);
        }
    }) ();
}
