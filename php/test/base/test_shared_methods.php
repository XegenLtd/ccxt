<?php
namespace ccxt;
use \ccxt\Precise;

// ----------------------------------------------------------------------------

// PLEASE DO NOT EDIT THIS FILE, IT IS GENERATED AND WILL BE OVERWRITTEN:
// https://github.com/ccxt/ccxt/blob/master/CONTRIBUTING.md#how-to-contribute-code

// -----------------------------------------------------------------------------


function log_template($exchange, $method, $entry) {
    return ' <<< ' . $exchange->id . ' ' . $method . ' ::: ' . $exchange->json($entry) . ' >>> ';
}


function string_value($value) {
    $string_val = null;
    if (is_string($value)) {
        $string_val = $value;
    } elseif ($value === null) {
        $string_val = 'undefined';
    } else {
        $string_val = ((string) $value);
    }
    return $string_val;
}


function assert_type($exchange, $skipped_properties, $entry, $key, $format) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    // because "typeof" string is not transpilable without === 'name', we list them manually at this moment
    $entry_key_val = $exchange->safe_value($entry, $key);
    $format_key_val = $exchange->safe_value($format, $key);
    $same_string = (is_string($entry_key_val)) && (is_string($format_key_val));
    $same_numeric = ((is_int($entry_key_val) || is_float($entry_key_val))) && ((is_int($format_key_val) || is_float($format_key_val)));
    $same_boolean = (($entry_key_val === true) || ($entry_key_val === false)) && (($format_key_val === true) || ($format_key_val === false));
    $same_array = gettype($entry_key_val) === 'array' && array_keys($entry_key_val) === array_keys(array_keys($entry_key_val)) && gettype($format_key_val) === 'array' && array_keys($format_key_val) === array_keys(array_keys($format_key_val));
    $same_object = (is_array($entry_key_val)) && (is_array($format_key_val));
    $result = ($entry_key_val === null) || $same_string || $same_numeric || $same_boolean || $same_array || $same_object;
    return $result;
}


function assert_structure($exchange, $skipped_properties, $method, $entry, $format, $empty_allowed_for = []) {
    $log_text = log_template($exchange, $method, $entry);
    assert($entry, 'item is null/undefined' . $log_text);
    // get all expected & predefined keys for this specific item and ensure thos ekeys exist in parsed structure
    if (gettype($format) === 'array' && array_keys($format) === array_keys(array_keys($format))) {
        assert(gettype($entry) === 'array' && array_keys($entry) === array_keys(array_keys($entry)), 'entry is not an array' . $log_text);
        $real_length = count($entry);
        $expected_length = count($format);
        assert($real_length === $expected_length, 'entry length is not equal to expected length of ' . ((string) $expected_length) . $log_text);
        for ($i = 0; $i < count($format); $i++) {
            $empty_allowed_for_this_key = $exchange->in_array($i, $empty_allowed_for);
            $value = $entry[$i];
            // check when:
            // - it's not inside "allowe empty values" list
            // - it's not undefined
            if ($empty_allowed_for_this_key && ($value === null)) {
                continue;
            }
            assert($value !== null, ((string) $i) . ' index is expected to have a value' . $log_text);
            // because of other langs, this is needed for arrays
            assert(assert_type($exchange, $skipped_properties, $entry, $i, $format), ((string) $i) . ' index does not have an expected type ' . $log_text);
        }
    } else {
        assert(is_array($entry), 'entry is not an object' . $log_text);
        $keys = is_array($format) ? array_keys($format) : array();
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
                continue;
            }
            assert(is_array($entry) && array_key_exists($key, $entry), '\"' . string_value($key) . '\" key is missing from structure' . $log_text);
            $empty_allowed_for_this_key = $exchange->in_array($key, $empty_allowed_for);
            $value = $entry[$key];
            // check when:
            // - it's not inside "allowe empty values" list
            // - it's not undefined
            if ($empty_allowed_for_this_key && ($value === null)) {
                continue;
            }
            // if it was in needed keys, then it should have value.
            assert($value !== null, '\"' . string_value($key) . '\" key is expected to have a value' . $log_text);
            // add exclusion for info key, as it can be any type
            if ($key !== 'info') {
                assert(assert_type($exchange, $skipped_properties, $entry, $key, $format), '\"' . string_value($key) . '\" key is neither undefined, neither of expected type' . $log_text);
            }
        }
    }
}


function assert_timestamp($exchange, $skipped_properties, $method, $entry, $now_to_check = null, $key_name_or_index = 'timestamp') {
    $log_text = log_template($exchange, $method, $entry);
    $skip_value = $exchange->safe_value($skipped_properties, $key_name_or_index);
    if ($skip_value !== null) {
        return;  // skipped
    }
    $is_date_time_object = is_string($key_name_or_index);
    if ($is_date_time_object) {
        assert((is_array($entry) && array_key_exists($key_name_or_index, $entry)), 'timestamp key \"' . $key_name_or_index . '\" is missing from structure' . $log_text);
    } else {
        // if index was provided (mostly from fetchOHLCV) then we check if it exists, as mandatory
        assert(!($entry[$key_name_or_index] === null), 'timestamp index ' . string_value($key_name_or_index) . ' is undefined' . $log_text);
    }
    $ts = $entry[$key_name_or_index];
    if ($ts !== null) {
        assert((is_int($ts) || is_float($ts)), 'timestamp is not numeric' . $log_text);
        assert(is_int($ts), 'timestamp should be an integer' . $log_text);
        $min_ts = 1230940800000; // 03 Jan 2009 - first block
        $max_ts = 2147483648000; // 03 Jan 2009 - first block
        assert($ts > $min_ts, 'timestamp is impossible to be before ' . ((string) $min_ts) . ' (03.01.2009)' . $log_text); // 03 Jan 2009 - first block
        assert($ts < $max_ts, 'timestamp more than ' . ((string) $max_ts) . ' (19.01.2038)' . $log_text); // 19 Jan 2038 - int32 overflows // 7258118400000  -> Jan 1 2200
        if ($now_to_check !== null) {
            $max_ms_offset = 60000; // 1 min
            assert($ts < $now_to_check + $max_ms_offset, 'returned item timestamp (' . $exchange->iso8601($ts) . ') is ahead of the current time (' . $exchange->iso8601($now_to_check) . ')' . $log_text);
        }
    }
}


function assert_timestamp_and_datetime($exchange, $skipped_properties, $method, $entry, $now_to_check = null, $key_name_or_index = 'timestamp') {
    $log_text = log_template($exchange, $method, $entry);
    $skip_value = $exchange->safe_value($skipped_properties, $key_name_or_index);
    if ($skip_value !== null) {
        return;
    }
    assert_timestamp($exchange, $skipped_properties, $method, $entry, $now_to_check, $key_name_or_index);
    $is_date_time_object = is_string($key_name_or_index);
    // only in case if the entry is a dictionary, thus it must have 'timestamp' & 'datetime' string keys
    if ($is_date_time_object) {
        // we also test 'datetime' here because it's certain sibling of 'timestamp'
        assert((is_array($entry) && array_key_exists('datetime', $entry)), '\"datetime\" key is missing from structure' . $log_text);
        $dt = $entry['datetime'];
        if ($dt !== null) {
            assert(is_string($dt), '\"datetime\" key does not have a string value' . $log_text);
            // there are exceptional cases, like getting microsecond-targeted string '2022-08-08T22:03:19.014680Z', so parsed unified timestamp, which carries only 13 digits (millisecond precision) can not be stringified back to microsecond accuracy, causing the bellow assertion to fail
            //    assert (dt === exchange.iso8601 (entry['timestamp']))
            // so, we have to compare with millisecond accururacy
            $dt_parsed = $exchange->parse8601($dt);
            assert($exchange->iso8601($dt_parsed) === $exchange->iso8601($entry['timestamp']), 'datetime is not iso8601 of timestamp' . $log_text);
        }
    }
}


function assert_currency_code($exchange, $skipped_properties, $method, $entry, $actual_code, $expected_code = null) {
    if (is_array($skipped_properties) && array_key_exists('currency', $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    if ($actual_code !== null) {
        assert(is_string($actual_code), 'currency code should be either undefined or a string' . $log_text);
        assert((is_array($exchange->currencies) && array_key_exists($actual_code, $exchange->currencies)), 'currency code (\"' . $actual_code . '\") should be present in exchange.currencies' . $log_text);
        if ($expected_code !== null) {
            assert($actual_code === $expected_code, 'currency code in response (\"' . string_value($actual_code) . '\") should be equal to expected code (\"' . string_value($expected_code) . '\")' . $log_text);
        }
    }
}


function assert_valid_currency_id_and_code($exchange, $skipped_properties, $method, $entry, $currency_id, $currency_code) {
    // this is exclusive exceptional key name to be used in `skip-tests.json`, to skip check for currency id and code
    if (is_array($skipped_properties) && array_key_exists('currencyIdAndCode', $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    $undefined_values = $currency_id === null && $currency_code === null;
    $defined_values = $currency_id !== null && $currency_code !== null;
    assert($undefined_values || $defined_values, 'currencyId and currencyCode should be either both defined or both undefined' . $log_text);
    if ($defined_values) {
        // check by code
        $currency_by_code = $exchange->currency($currency_code);
        assert($currency_by_code['id'] === $currency_id, 'currencyId \"' . string_value($currency_id) . '\" does not match currency of code: \"' . string_value($currency_code) . '\"' . $log_text);
        // check by id
        $currency_by_id = $exchange->safe_currency($currency_id);
        assert($currency_by_id['code'] === $currency_code, 'currencyCode ' . string_value($currency_code) . ' does not match currency of id: ' . string_value($currency_id) . $log_text);
    }
}


function assert_symbol($exchange, $skipped_properties, $method, $entry, $key, $expected_symbol = null) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    $actual_symbol = $exchange->safe_string($entry, $key);
    if ($actual_symbol !== null) {
        assert(is_string($actual_symbol), 'symbol should be either undefined or a string' . $log_text);
        assert((is_array($exchange->markets) && array_key_exists($actual_symbol, $exchange->markets)), 'symbol should be present in exchange.symbols' . $log_text);
    }
    if ($expected_symbol !== null) {
        assert($actual_symbol === $expected_symbol, 'symbol in response (\"' . string_value($actual_symbol) . '\") should be equal to expected symbol (\"' . string_value($expected_symbol) . '\")' . $log_text);
    }
}


function assert_greater($exchange, $skipped_properties, $method, $entry, $key, $compare_to) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    $value = $exchange->safe_string($entry, $key);
    if ($value !== null) {
        assert(Precise::string_gt($value, $compare_to), string_value($key) . ' key (with a value of ' . string_value($value) . ') was expected to be > ' . string_value($compare_to) . $log_text);
    }
}


function assert_greater_or_equal($exchange, $skipped_properties, $method, $entry, $key, $compare_to) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    $value = $exchange->safe_string($entry, $key);
    if ($value !== null && $compare_to !== null) {
        assert(Precise::string_ge($value, $compare_to), string_value($key) . ' key (with a value of ' . string_value($value) . ') was expected to be >= ' . string_value($compare_to) . $log_text);
    }
}


function assert_less($exchange, $skipped_properties, $method, $entry, $key, $compare_to) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    $value = $exchange->safe_string($entry, $key);
    if ($value !== null && $compare_to !== null) {
        assert(Precise::string_lt($value, $compare_to), string_value($key) . ' key (with a value of ' . string_value($value) . ') was expected to be < ' . string_value($compare_to) . $log_text);
    }
}


function assert_less_or_equal($exchange, $skipped_properties, $method, $entry, $key, $compare_to) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    $value = $exchange->safe_string($entry, $key);
    if ($value !== null && $compare_to !== null) {
        assert(Precise::string_le($value, $compare_to), string_value($key) . ' key (with a value of ' . string_value($value) . ') was expected to be <= ' . string_value($compare_to) . $log_text);
    }
}


function assert_equal($exchange, $skipped_properties, $method, $entry, $key, $compare_to) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    $value = $exchange->safe_string($entry, $key);
    if ($value !== null && $compare_to !== null) {
        assert(Precise::string_eq($value, $compare_to), string_value($key) . ' key (with a value of ' . string_value($value) . ') was expected to be equal to ' . string_value($compare_to) . $log_text);
    }
}


function assert_non_equal($exchange, $skipped_properties, $method, $entry, $key, $compare_to) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    $value = $exchange->safe_string($entry, $key);
    if ($value !== null) {
        assert(!Precise::string_eq($value, $compare_to), string_value($key) . ' key (with a value of ' . string_value($value) . ') was expected not to be equal to ' . string_value($compare_to) . $log_text);
    }
}


function assert_in_array($exchange, $skipped_properties, $method, $entry, $key, $expected_array) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    $value = $exchange->safe_value($entry, $key);
    // todo: remove undefined check
    if ($value !== null) {
        $stingified_array_value = $exchange->json($expected_array); // don't use expectedArray.join (','), as it bugs in other languages, if values are bool, undefined or etc..
        assert($exchange->in_array($value, $expected_array), '\"' . string_value($key) . '\" key (value \"' . string_value($value) . '\") is not from the expected list : [' . $stingified_array_value . ']' . $log_text);
    }
}


function assert_fee_structure($exchange, $skipped_properties, $method, $entry, $key) {
    $log_text = log_template($exchange, $method, $entry);
    $key_string = string_value($key);
    if (is_int($key)) {
        assert(gettype($entry) === 'array' && array_keys($entry) === array_keys(array_keys($entry)), 'fee container is expected to be an array' . $log_text);
        assert($key < count($entry), 'fee key ' . $key_string . ' was expected to be present in entry' . $log_text);
    } else {
        assert(is_array($entry), 'fee container is expected to be an object' . $log_text);
        assert(is_array($entry) && array_key_exists($key, $entry), 'fee key \"' . $key . '\" was expected to be present in entry' . $log_text);
    }
    $fee_object = $exchange->safe_value($entry, $key);
    // todo: remove undefined check to make stricter
    if ($fee_object !== null) {
        assert(is_array($fee_object) && array_key_exists('cost', $fee_object), $key_string . ' fee object should contain \"cost\" key' . $log_text);
        // assertGreaterOrEqual (exchange, skippedProperties, method, feeObject, 'cost', '0'); // fee might be negative in the case of a rebate or reward
        assert(is_array($fee_object) && array_key_exists('currency', $fee_object), '\"' . $key_string . '\" fee object should contain \"currency\" key' . $log_text);
        assert_currency_code($exchange, $skipped_properties, $method, $entry, $fee_object['currency']);
    }
}


function assert_timestamp_order($exchange, $method, $code_or_symbol, $items, $ascending = false) {
    for ($i = 0; $i < count($items); $i++) {
        if ($i > 0) {
            $ascending_or_descending = $ascending ? 'ascending' : 'descending';
            $first_index = $ascending ? $i - 1 : $i;
            $second_index = $ascending ? $i : $i - 1;
            $first_ts = $items[$first_index]['timestamp'];
            $second_ts = $items[$second_index]['timestamp'];
            if ($first_ts !== null && $second_ts !== null) {
                assert($items[$first_index]['timestamp'] >= $items[$second_index]['timestamp'], $exchange->id . ' ' . $method . ' ' . string_value($code_or_symbol) . ' must return a ' . $ascending_or_descending . ' sorted array of items by timestamp. ' . $exchange->json($items));
            }
        }
    }
}


function assert_integer($exchange, $skipped_properties, $method, $entry, $key) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $log_text = log_template($exchange, $method, $entry);
    if ($entry !== null) {
        $value = $exchange->safe_value($entry, $key);
        if ($value !== null) {
            $is_integer = is_int($value);
            assert($is_integer, '\"' . string_value($key) . '\" key (value \"' . string_value($value) . '\") is not an integer' . $log_text);
        }
    }
}


function check_precision_accuracy($exchange, $skipped_properties, $method, $entry, $key) {
    if (is_array($skipped_properties) && array_key_exists($key, $skipped_properties)) {
        return;
    }
    $is_tick_size_precisionMode = $exchange->precisionMode === \ccxt\TICK_SIZE;
    if ($is_tick_size_precisionMode) {
        // \ccxt\TICK_SIZE should be above zero
        assert_greater($exchange, $skipped_properties, $method, $entry, $key, '0');
        // the below array of integers are inexistent tick-sizes (theoretically technically possible, but not in real-world cases), so their existence in our case indicates to incorrectly implemented tick-sizes, which might mistakenly be implemented with DECIMAL_PLACES, so we throw error
        $decimal_numbers = ['2', '3', '4', '6', '7', '8', '9', '11', '12', '13', '14', '15', '16'];
        for ($i = 0; $i < count($decimal_numbers); $i++) {
            $num = $decimal_numbers[$i];
            $num_str = $num;
            assert_non_equal($exchange, $skipped_properties, $method, $entry, $key, $num_str);
        }
    } else {
        assert_integer($exchange, $skipped_properties, $method, $entry, $key); // should be integer
        assert_less_or_equal($exchange, $skipped_properties, $method, $entry, $key, '18'); // should be under 18 decimals
        assert_greater_or_equal($exchange, $skipped_properties, $method, $entry, $key, '-8'); // in real-world cases, there would not be less than that
    }
}
