
// @ts-nocheck
// eslint-disable-next-line
import { functions } from '../../../../ccxt.js';
import { PreciseNs } from '../../../base/Precise.js'
import assert from 'assert';
const { numberToString, decimalToPrecision, ROUND, TRUNCATE, DECIMAL_PLACES, TICK_SIZE, PAD_WITH_ZERO, SIGNIFICANT_DIGITS} = functions;
// ----------------------------------------------------------------------------
// numberToString

assert (numberToString (-7.8e-7) === '-0.00000078');
assert (numberToString (7.8e-7) === '0.00000078');
assert (numberToString (-17.805e-7) === '-0.0000017805');
assert (numberToString (17.805e-7) === '0.0000017805');
assert (numberToString (-7.0005e27) === '-7000500000000000000000000000');
assert (numberToString (7.0005e27) === '7000500000000000000000000000');
assert (numberToString (-7.9e27) === '-7900000000000000000000000000');
assert (numberToString (7e27) === '7000000000000000000000000000');
assert (numberToString (7.9e27) === '7900000000000000000000000000');
assert (numberToString (-12.345) === '-12.345');
assert (numberToString (12.345) === '12.345');
assert (numberToString (0) === '0');
assert (numberToString (7.35946e21) === '7359460000000000000000');
assert (numberToString (0.00000001) === '0.00000001');
assert (numberToString (1e-7) === '0.0000001');
assert (numberToString (-1e-7) === '-0.0000001');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionTruncationToNDigitsAfterDot

assert (decimalToPrecision ('12.3456000', TRUNCATE, 100, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', TRUNCATE, 100, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', TRUNCATE, 4, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', TRUNCATE, 3, DECIMAL_PLACES) === '12.345');
assert (decimalToPrecision ('12.3456', TRUNCATE, 2, DECIMAL_PLACES) === '12.34');
assert (decimalToPrecision ('12.3456', TRUNCATE, 1, DECIMAL_PLACES) === '12.3');
assert (decimalToPrecision ('12.3456', TRUNCATE, 0, DECIMAL_PLACES) === '12');

assert (decimalToPrecision ('0.0000001', TRUNCATE, 8, DECIMAL_PLACES) === '0.0000001');
assert (decimalToPrecision ('0.00000001', TRUNCATE, 8, DECIMAL_PLACES) === '0.00000001');

assert (decimalToPrecision ('0.000000000', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO) === '0.000000000');
assert (decimalToPrecision ('0.000000001', TRUNCATE, 9, DECIMAL_PLACES, PAD_WITH_ZERO) === '0.000000001');

assert (decimalToPrecision ('12.3456', TRUNCATE, -1, DECIMAL_PLACES) === '10');
assert (decimalToPrecision ('123.456', TRUNCATE, -1, DECIMAL_PLACES) === '120');
assert (decimalToPrecision ('123.456', TRUNCATE, -2, DECIMAL_PLACES) === '100');
assert (decimalToPrecision ('9.99999', TRUNCATE, -1, DECIMAL_PLACES) === '0');
assert (decimalToPrecision ('99.9999', TRUNCATE, -1, DECIMAL_PLACES) === '90');
assert (decimalToPrecision ('99.9999', TRUNCATE, -2, DECIMAL_PLACES) === '0');

assert (decimalToPrecision ('0', TRUNCATE, 0, DECIMAL_PLACES) === '0');
assert (decimalToPrecision ('-0.9', TRUNCATE, 0, DECIMAL_PLACES) === '0');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionTruncationToNSignificantDigits

assert (decimalToPrecision ('0.000123456700', TRUNCATE, 100, SIGNIFICANT_DIGITS) === '0.0001234567');
assert (decimalToPrecision ('0.0001234567', TRUNCATE, 100, SIGNIFICANT_DIGITS) === '0.0001234567');
assert (decimalToPrecision ('0.0001234567', TRUNCATE, 7, SIGNIFICANT_DIGITS) === '0.0001234567');

assert (decimalToPrecision ('0.000123456', TRUNCATE, 6, SIGNIFICANT_DIGITS) === '0.000123456');
assert (decimalToPrecision ('0.000123456', TRUNCATE, 5, SIGNIFICANT_DIGITS) === '0.00012345');
assert (decimalToPrecision ('0.000123456', TRUNCATE, 2, SIGNIFICANT_DIGITS) === '0.00012');
assert (decimalToPrecision ('0.000123456', TRUNCATE, 1, SIGNIFICANT_DIGITS) === '0.0001');

assert (decimalToPrecision ('123.0000987654', TRUNCATE, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.0000987');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 8, SIGNIFICANT_DIGITS) === '123.00009');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 7, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.0000');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 6, SIGNIFICANT_DIGITS) === '123');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.00');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS) === '123');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123.0');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 3, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '123');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 2, SIGNIFICANT_DIGITS) === '120');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS) === '100');
assert (decimalToPrecision ('123.0000987654', TRUNCATE, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '100');

assert (decimalToPrecision ('1234', TRUNCATE, 5, SIGNIFICANT_DIGITS) === '1234');
assert (decimalToPrecision ('1234', TRUNCATE, 5, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '1234.0');
assert (decimalToPrecision ('1234', TRUNCATE, 4, SIGNIFICANT_DIGITS) === '1234');
assert (decimalToPrecision ('1234', TRUNCATE, 4, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '1234');
assert (decimalToPrecision ('1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS) === '0');
assert (decimalToPrecision ('1234.69', TRUNCATE, 0, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToNDigitsAfterDot

assert (decimalToPrecision ('12.3456000', ROUND, 100, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', ROUND, 100, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', ROUND, 4, DECIMAL_PLACES) === '12.3456');
assert (decimalToPrecision ('12.3456', ROUND, 3, DECIMAL_PLACES) === '12.346');
assert (decimalToPrecision ('12.3456', ROUND, 2, DECIMAL_PLACES) === '12.35');
assert (decimalToPrecision ('12.3456', ROUND, 1, DECIMAL_PLACES) === '12.3');
assert (decimalToPrecision ('12.3456', ROUND, 0, DECIMAL_PLACES) === '12');

// a problematic case in PHP
assert (decimalToPrecision ('10000', ROUND, 6, DECIMAL_PLACES) === '10000');
assert (decimalToPrecision ('0.00003186', ROUND, 8, DECIMAL_PLACES) === '0.00003186');

assert (decimalToPrecision ('12.3456', ROUND, -1, DECIMAL_PLACES) === '10');
assert (decimalToPrecision ('123.456', ROUND, -1, DECIMAL_PLACES) === '120');
assert (decimalToPrecision ('123.456', ROUND, -2, DECIMAL_PLACES) === '100');
assert (decimalToPrecision ('9.99999', ROUND, -1, DECIMAL_PLACES) === '10');
assert (decimalToPrecision ('99.9999', ROUND, -1, DECIMAL_PLACES) === '100');
assert (decimalToPrecision ('99.9999', ROUND, -2, DECIMAL_PLACES) === '100');

assert (decimalToPrecision ('9.999', ROUND, 3, DECIMAL_PLACES) === '9.999');
assert (decimalToPrecision ('9.999', ROUND, 2, DECIMAL_PLACES) === '10');
assert (decimalToPrecision ('9.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO) === '10.00');
assert (decimalToPrecision ('99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO) === '100.00');
assert (decimalToPrecision ('-99.999', ROUND, 2, DECIMAL_PLACES, PAD_WITH_ZERO) === '-100.00');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToNSignificantDigits

assert (decimalToPrecision ('0.000123456700', ROUND, 100, SIGNIFICANT_DIGITS) === '0.0001234567');
assert (decimalToPrecision ('0.0001234567', ROUND, 100, SIGNIFICANT_DIGITS) === '0.0001234567');
assert (decimalToPrecision ('0.0001234567', ROUND, 7, SIGNIFICANT_DIGITS) === '0.0001234567');

assert (decimalToPrecision ('0.000123456', ROUND, 6, SIGNIFICANT_DIGITS) === '0.000123456');
assert (decimalToPrecision ('0.000123456', ROUND, 5, SIGNIFICANT_DIGITS) === '0.00012346');
assert (decimalToPrecision ('0.000123456', ROUND, 4, SIGNIFICANT_DIGITS) === '0.0001235');
assert (decimalToPrecision ('0.00012', ROUND, 2, SIGNIFICANT_DIGITS) === '0.00012');
assert (decimalToPrecision ('0.0001', ROUND, 1, SIGNIFICANT_DIGITS) === '0.0001');

assert (decimalToPrecision ('123.0000987654', ROUND, 7, SIGNIFICANT_DIGITS) === '123.0001');
assert (decimalToPrecision ('123.0000987654', ROUND, 6, SIGNIFICANT_DIGITS) === '123');

assert (decimalToPrecision ('0.00098765', ROUND, 2, SIGNIFICANT_DIGITS) === '0.00099');
assert (decimalToPrecision ('0.00098765', ROUND, 2, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0.00099');

assert (decimalToPrecision ('0.00098765', ROUND, 1, SIGNIFICANT_DIGITS) === '0.001');
assert (decimalToPrecision ('0.00098765', ROUND, 10, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0.0009876500000');

assert (decimalToPrecision ('0.098765', ROUND, 1, SIGNIFICANT_DIGITS, PAD_WITH_ZERO) === '0.1');

assert (decimalToPrecision ('0', ROUND, 0, SIGNIFICANT_DIGITS) === '0');
assert (decimalToPrecision ('-0.123', ROUND, 0, SIGNIFICANT_DIGITS) === '0');

assert (decimalToPrecision ('0.00000044', ROUND, 5, SIGNIFICANT_DIGITS) === '0.00000044');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionRoundingToTickSize

assert (decimalToPrecision ('0.000123456700', ROUND, 0.00012, TICK_SIZE) === '0.00012');
assert (decimalToPrecision ('0.0001234567', ROUND, 0.00013, TICK_SIZE) === '0.00013');
assert (decimalToPrecision ('0.0001234567', TRUNCATE, 0.00013, TICK_SIZE) === '0');
assert (decimalToPrecision ('101.000123456700', ROUND, 100, TICK_SIZE) === '100');
assert (decimalToPrecision ('0.000123456700', ROUND, 100, TICK_SIZE) === '0');
assert (decimalToPrecision ('165', TRUNCATE, 110, TICK_SIZE) === '110');
assert (decimalToPrecision ('3210', TRUNCATE, 1110, TICK_SIZE) === '2220');
assert (decimalToPrecision ('165', ROUND, 110, TICK_SIZE) === '220');
assert (decimalToPrecision ('0.000123456789', ROUND, 0.00000012, TICK_SIZE) === '0.00012348');
assert (decimalToPrecision ('0.000123456789', TRUNCATE, 0.00000012, TICK_SIZE) === '0.00012336');
assert (decimalToPrecision ('0.000273398', ROUND, 1e-7, TICK_SIZE) === '0.0002734');

assert (decimalToPrecision ('0.00005714', TRUNCATE, 0.00000001, TICK_SIZE) === '0.00005714');
// this line causes problems in JS, fix with Precise
// assert (decimalToPrecision ('0.0000571495257361', TRUNCATE, 0.00000001, TICK_SIZE) === '0.00005714');

assert (decimalToPrecision ('0.01', ROUND, 0.0001, TICK_SIZE, PAD_WITH_ZERO) === '0.0100');
assert (decimalToPrecision ('0.01', TRUNCATE, 0.0001, TICK_SIZE, PAD_WITH_ZERO) === '0.0100');

assert (decimalToPrecision ('-0.000123456789', ROUND, 0.00000012, TICK_SIZE) === '-0.00012348');
assert (decimalToPrecision ('-0.000123456789', TRUNCATE, 0.00000012, TICK_SIZE) === '-0.00012336');
assert (decimalToPrecision ('-165', TRUNCATE, 110, TICK_SIZE) === '-110');
assert (decimalToPrecision ('-165', ROUND, 110, TICK_SIZE) === '-220');
assert (decimalToPrecision ('-1650', TRUNCATE, 1100, TICK_SIZE) === '-1100');
assert (decimalToPrecision ('-1650', ROUND, 1100, TICK_SIZE) === '-2200');

assert (decimalToPrecision ('0.0006', TRUNCATE, 0.0001, TICK_SIZE) === '0.0006');
assert (decimalToPrecision ('-0.0006', TRUNCATE, 0.0001, TICK_SIZE) === '-0.0006');
assert (decimalToPrecision ('0.6', TRUNCATE, 0.2, TICK_SIZE) === '0.6');
assert (decimalToPrecision ('-0.6', TRUNCATE, 0.2, TICK_SIZE) === '-0.6');
assert (decimalToPrecision ('1.2', ROUND, 0.4, TICK_SIZE) === '1.2');
assert (decimalToPrecision ('-1.2', ROUND, 0.4, TICK_SIZE) === '-1.2');
assert (decimalToPrecision ('1.2', ROUND, 0.02, TICK_SIZE) === '1.2');
assert (decimalToPrecision ('-1.2', ROUND, 0.02, TICK_SIZE) === '-1.2');
assert (decimalToPrecision ('44', ROUND, 4.4, TICK_SIZE) === '44');
assert (decimalToPrecision ('-44', ROUND, 4.4, TICK_SIZE) === '-44');
assert (decimalToPrecision ('44.00000001', ROUND, 4.4, TICK_SIZE) === '44');
assert (decimalToPrecision ('-44.00000001', ROUND, 4.4, TICK_SIZE) === '-44');

// https://github.com/ccxt/ccxt/issues/6731
assert (decimalToPrecision ('20', TRUNCATE, 0.00000001, TICK_SIZE) === '20');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionNegativeNumbers

assert (decimalToPrecision ('-0.123456', TRUNCATE, 5, DECIMAL_PLACES) === '-0.12345');
assert (decimalToPrecision ('-0.123456', ROUND, 5, DECIMAL_PLACES) === '-0.12346');

// ----------------------------------------------------------------------------
// decimalToPrecision: without dot / trailing dot

assert (decimalToPrecision ('123', TRUNCATE, 0) === '123');

assert (decimalToPrecision ('123', TRUNCATE, 5, DECIMAL_PLACES) === '123');
assert (decimalToPrecision ('123', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO) === '123.00000');

assert (decimalToPrecision ('123.', TRUNCATE, 0, DECIMAL_PLACES) === '123');
assert (decimalToPrecision ('123.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO) === '123.00000');

assert (decimalToPrecision ('0.', TRUNCATE, 0) === '0');
assert (decimalToPrecision ('0.', TRUNCATE, 5, DECIMAL_PLACES, PAD_WITH_ZERO) === '0.00000');

// ----------------------------------------------------------------------------
// decimalToPrecision: rounding for equidistant digits

assert (decimalToPrecision ('1.44', ROUND, 1, DECIMAL_PLACES) === '1.4');
assert (decimalToPrecision ('1.45', ROUND, 1, DECIMAL_PLACES) === '1.5');
assert (decimalToPrecision ('1.45', ROUND, 0, DECIMAL_PLACES) === '1'); // not 2

// ----------------------------------------------------------------------------
// negative precision only implemented so far in python
// pretty useless for decimal applications as anything |x| < 5 === 0
// NO_PADDING and PAD_WITH_ZERO are ignored

assert (decimalToPrecision ('5', ROUND, -1, DECIMAL_PLACES) === '10');
assert (decimalToPrecision ('4.999', ROUND, -1, DECIMAL_PLACES) === '0');
assert (decimalToPrecision ('0.0431531423', ROUND, -1, DECIMAL_PLACES) === '0');
assert (decimalToPrecision ('-69.3', ROUND, -1, DECIMAL_PLACES) === '-70');
assert (decimalToPrecision ('5001', ROUND, -4, DECIMAL_PLACES) === '10000');
assert (decimalToPrecision ('4999.999', ROUND, -4, DECIMAL_PLACES) === '0');

assert (decimalToPrecision ('69.3', TRUNCATE, -2, DECIMAL_PLACES) === '0');
assert (decimalToPrecision ('-69.3', TRUNCATE, -2, DECIMAL_PLACES) === '0');
assert (decimalToPrecision ('69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS) === '60');
assert (decimalToPrecision ('-69.3', TRUNCATE, -1, SIGNIFICANT_DIGITS) === '-60');
assert (decimalToPrecision ('69.3', TRUNCATE, -2, SIGNIFICANT_DIGITS) === '0');
assert (decimalToPrecision ('1602000000000000000000', TRUNCATE, 3, SIGNIFICANT_DIGITS) === '1600000000000000000000');

// ----------------------------------------------------------------------------
// decimal_to_precision: stringified precision
assert (decimalToPrecision ('-0.000123456789', ROUND, '0.00000012', TICK_SIZE) === '-0.00012348');
assert (decimalToPrecision ('-0.000123456789', TRUNCATE, '0.00000012', TICK_SIZE) === '-0.00012336');
assert (decimalToPrecision ('-165', TRUNCATE, '110', TICK_SIZE) === '-110');
assert (decimalToPrecision ('-165', ROUND, '110', TICK_SIZE) === '-220');

// ----------------------------------------------------------------------------
// testDecimalToPrecisionErrorHandling (todo)
//
// throws (() =>
//     decimalToPrecision ('123456.789', TRUNCATE, -2, DECIMAL_PLACES),
//         'negative precision is not yet supported')
//
// throws (() =>
//     decimalToPrecision ('foo'),
//         "invalid number (contains an illegal character 'f')")
//
// throws (() =>
//     decimalToPrecision ('0.01', TRUNCATE, -1, TICK_SIZE),
//         "TICK_SIZE cant be used with negative numPrecisionDigits")

// ----------------------------------------------------------------------------

const w = '-1.123e-6';
const x = '0.00000002';
const y = '69696900000';
const z = '0';
const a = '1e8';

assert (PreciseNs.stringMul (x, y) === '1393.938');
assert (PreciseNs.stringMul (y, x) === '1393.938');
assert (PreciseNs.stringAdd (x, y) === '69696900000.00000002');
assert (PreciseNs.stringAdd (y, x) === '69696900000.00000002');
assert (PreciseNs.stringSub (x, y) === '-69696899999.99999998');
assert (PreciseNs.stringSub (y, x) === '69696899999.99999998');
assert (PreciseNs.stringDiv (x, y, 1) === '0');
assert (PreciseNs.stringDiv (x, y) === '0');
assert (PreciseNs.stringDiv (x, y, 19) === '0.0000000000000000002');
assert (PreciseNs.stringDiv (x, y, 20) === '0.00000000000000000028');
assert (PreciseNs.stringDiv (x, y, 21) === '0.000000000000000000286');
assert (PreciseNs.stringDiv (x, y, 22) === '0.0000000000000000002869');
assert (PreciseNs.stringDiv (y, x) === '3484845000000000000');

assert (PreciseNs.stringMul (x, w) === '-0.00000000000002246');
assert (PreciseNs.stringMul (w, x) === '-0.00000000000002246');
assert (PreciseNs.stringAdd (x, w) === '-0.000001103');
assert (PreciseNs.stringAdd (w, x) === '-0.000001103');
assert (PreciseNs.stringSub (x, w) === '0.000001143');
assert (PreciseNs.stringSub (w, x) === '-0.000001143');
assert (PreciseNs.stringDiv (x, w) === '-0.017809439002671415');
assert (PreciseNs.stringDiv (w, x) === '-56.15');

assert (PreciseNs.stringMul (z, w) === '0');
assert (PreciseNs.stringMul (z, x) === '0');
assert (PreciseNs.stringMul (z, y) === '0');
assert (PreciseNs.stringMul (w, z) === '0');
assert (PreciseNs.stringMul (x, z) === '0');
assert (PreciseNs.stringMul (y, z) === '0');
assert (PreciseNs.stringAdd (z, w) === '-0.000001123');
assert (PreciseNs.stringAdd (z, x) === '0.00000002');
assert (PreciseNs.stringAdd (z, y) === '69696900000');
assert (PreciseNs.stringAdd (w, z) === '-0.000001123');
assert (PreciseNs.stringAdd (x, z) === '0.00000002');
assert (PreciseNs.stringAdd (y, z) === '69696900000');

assert (PreciseNs.stringMul (x, a) === '2');
assert (PreciseNs.stringMul (a, x) === '2');
assert (PreciseNs.stringMul (y, a) === '6969690000000000000');
assert (PreciseNs.stringMul (a, y) === '6969690000000000000');
assert (PreciseNs.stringDiv (y, a) === '696.969');
assert (PreciseNs.stringDiv (y, a, -1) === '690');
assert (PreciseNs.stringDiv (y, a, 0) === '696');
assert (PreciseNs.stringDiv (y, a, 1) === '696.9');
assert (PreciseNs.stringDiv (y, a, 2) === '696.96');
assert (PreciseNs.stringDiv (a, y) === '0.001434784043479695');

assert (PreciseNs.stringAbs ('0') === '0');
assert (PreciseNs.stringAbs ('-0') === '0');
assert (PreciseNs.stringAbs ('-500.1') === '500.1');
assert (PreciseNs.stringAbs ('213') === '213');

assert (PreciseNs.stringNeg ('0') === '0');
assert (PreciseNs.stringNeg ('-0') === '0');
assert (PreciseNs.stringNeg ('-500.1') === '500.1');
assert (PreciseNs.stringNeg ('213') === '-213');

assert (PreciseNs.stringMod ('57.123', '10') === '7.123');
assert (PreciseNs.stringMod ('18', '6') === '0');
assert (PreciseNs.stringMod ('10.1', '0.5') === '0.1');
assert (PreciseNs.stringMod ('10000000', '5555') === '1000');
assert (PreciseNs.stringMod ('5550', '120') === '30');

assert (PreciseNs.stringEquals ('1.0000', '1'));
assert (PreciseNs.stringEquals ('-0.0', '0'));
assert (PreciseNs.stringEquals ('-0.0', '0.0'));
assert (PreciseNs.stringEquals ('5.534000', '5.5340'));

assert (PreciseNs.stringMin ('1.0000', '2') === '1');
assert (PreciseNs.stringMin ('2', '1.2345') === '1.2345');
assert (PreciseNs.stringMin ('3.1415', '-2') === '-2');
assert (PreciseNs.stringMin ('-3.1415', '-2') === '-3.1415');
assert (PreciseNs.stringMin ('0.000', '-0.0') === '0');

assert (PreciseNs.stringMax ('1.0000', '2') === '2');
assert (PreciseNs.stringMax ('2', '1.2345') === '2');
assert (PreciseNs.stringMax ('3.1415', '-2') === '3.1415');
assert (PreciseNs.stringMax ('-3.1415', '-2') === '-2');
assert (PreciseNs.stringMax ('0.000', '-0.0') === '0');

assert (!PreciseNs.stringGt ('1.0000', '2'));
assert (PreciseNs.stringGt ('2', '1.2345'));
assert (PreciseNs.stringGt ('3.1415', '-2'));
assert (!PreciseNs.stringGt ('-3.1415', '-2'));
assert (!PreciseNs.stringGt ('3.1415', '3.1415'));
assert (PreciseNs.stringGt ('3.14150000000000000000001', '3.1415'));

assert (!PreciseNs.stringGe ('1.0000', '2'));
assert (PreciseNs.stringGe ('2', '1.2345'));
assert (PreciseNs.stringGe ('3.1415', '-2'));
assert (!PreciseNs.stringGe ('-3.1415', '-2'));
assert (PreciseNs.stringGe ('3.1415', '3.1415'));
assert (PreciseNs.stringGe ('3.14150000000000000000001', '3.1415'));

assert (PreciseNs.stringLt ('1.0000', '2'));
assert (!PreciseNs.stringLt ('2', '1.2345'));
assert (!PreciseNs.stringLt ('3.1415', '-2'));
assert (PreciseNs.stringLt ('-3.1415', '-2'));
assert (!PreciseNs.stringLt ('3.1415', '3.1415'));
assert (PreciseNs.stringLt ('3.1415', '3.14150000000000000000001'));

assert (PreciseNs.stringLe ('1.0000', '2'));
assert (!PreciseNs.stringLe ('2', '1.2345'));
assert (!PreciseNs.stringLe ('3.1415', '-2'));
assert (PreciseNs.stringLe ('-3.1415', '-2'));
assert (PreciseNs.stringLe ('3.1415', '3.1415'));
assert (PreciseNs.stringLe ('3.1415', '3.14150000000000000000001'));
