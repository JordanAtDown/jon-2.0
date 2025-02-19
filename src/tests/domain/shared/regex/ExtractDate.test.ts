import { describe, expect, test } from 'vitest';
import { DateTime } from 'luxon';
import { extractDate } from '../../../../domain/shared/regex/ExtractDate.js';
import routes from '../../../../domain/shared/regex/Routes.js';
import { expectNone, expectSome } from '../../../shared/utils/test/Expected.js';

describe('ExtractDate should', () => {
  const testCases = [
    {
      filename: 'IMG_1828-4-1_resized_20210820_010756159',
      expected: DateTime.fromISO('2021-08-20T01:07:56'),
    },
    {
      filename: '2016-04-27-13-14-04-347',
      expected: DateTime.fromISO('2016-04-27T13:14:04'),
    },
    {
      filename: '20170402_115152',
      expected: DateTime.fromISO('2017-04-02T11:51:52'),
    },
    {
      filename: '2003-12-07 04-22-47',
      expected: DateTime.fromISO('2003-12-07T04:22:47'),
    },
    {
      filename: '2014-01-14_09.12.18',
      expected: DateTime.fromISO('2014-01-14T09:12:18'),
    },
    {
      filename: 'PHOTOS PORTABLE LE 22 03 2015 005',
      expected: DateTime.fromISO('2015-03-22T00:00:00'),
    },
    {
      filename: '20170706_120528_001',
      expected: DateTime.fromISO('2017-07-06T12:05:28'),
    },
    {
      filename: '20171006_172526(0)',
      expected: DateTime.fromISO('2017-10-06T17:25:26'),
    },
    {
      filename: '20171006_172526',
      expected: DateTime.fromISO('2017-10-06T17:25:26'),
    },
    {
      filename: 'Screenshot_2015-07-30-08-14-30',
      expected: DateTime.fromISO('2015-07-30T08:14:30'),
    },

    {
      filename: 'IMG_20180416_220126',
      expected: DateTime.fromISO('2018-04-16T22:01:26'),
    },
    {
      filename: 'IMG_20180719_205840_01',
      expected: DateTime.fromISO('2018-07-19T20:58:40'),
    },
    {
      filename: 'IMG_18122021_1508-03',
      expected: DateTime.fromISO('2021-12-18T15:08:00'),
    },
    {
      filename: 'IMG_18122021_1508',
      expected: DateTime.fromISO('2021-12-18T15:08:00'),
    },
    {
      filename: 'IMG_20210803175810',
      expected: DateTime.fromISO('2021-08-03T17:58:10'),
    },
    {
      filename: 'IMG_20210612102118-02',
      expected: DateTime.fromISO('2021-06-12T10:21:18'),
    },
    {
      filename: 'IMG_20190525_080431-modifié',
      expected: DateTime.fromISO('2019-05-25T08:04:31'),
    },
    {
      filename: 'IMG_20190525_131228_BURST001_COVER',
      expected: DateTime.fromISO('2019-05-25T13:12:28'),
    },
    {
      filename: 'IMG_20190525_131228_BURST002',
      expected: DateTime.fromISO('2019-05-25T13:12:28'),
    },
    {
      filename: '20151231_155723_011',
      expected: DateTime.fromISO('2015-12-31T15:57:23'),
    },
    {
      filename: '20151231_155747',
      expected: DateTime.fromISO('2015-12-31T15:57:47'),
    },
    {
      filename: '2016-08-08 19.28.33',
      expected: DateTime.fromISO('2016-08-08T19:28:33'),
    },
    {
      filename: '2013-07-28 09.58.16',
      expected: DateTime.fromISO('2013-07-28T09:58:16'),
    },
    {
      filename: '2013-08-05 11.48.35(1)',
      expected: DateTime.fromISO('2013-08-05T11:48:35'),
    },
    {
      filename: 'P1000153',
      expected: null,
    },
    {
      filename: 'IMG_0012',
      expected: null,
    },
    {
      filename: 'Mes Photos0001',
      expected: null,
    },
    {
      filename: 'photo famille0050.',
      expected: null,
    },
    {
      filename: '53400010',
      expected: null,
    },
    {
      filename: 'paris 2012 049(1)',
      expected: null,
    },
    {
      filename: '_MG_6616 bis',
      expected: null,
    },
    {
      filename: 'Crabe royal. et fine rosace de boudin, verrine ',
      expected: null,
    },
  ];

  test.each(testCases)(
    'extract from the filename $filename',
    ({ filename, expected }) => {
      const result = extractDate(routes, filename);

      expected
        ? expectSome(result, (date) => expect(date).toEqual(expected))
        : expectNone(result);
    },
  );
});
