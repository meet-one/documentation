#!/usr/bin/env node

/**
 * @author kay <kay20475@hotmail.com>
 * @copyright MEET.ONE 2019
 * @description Use npm-coding-style.
 */

'use strict'

const { JsonRpc } = require('eosjs');
const fetch = require('node-fetch');
const rpc = new JsonRpc('https://mainnet.meet.one', { fetch });

rpc.get_table_rows({
  json: true,
  code: 'eosio',
  scope: 'eosio',
  table: 'rexpool',
  limit: 1
}).then(rexpool => {
  var totalLendable = rexpool.rows[0].total_lendable.split(' ')[0]
  var totalRex = rexpool.rows[0].total_rex.split(' ')[0]
  var totalLent = rexpool.rows[0].total_lent.split(' ')[0]
  var totalUnlent = rexpool.rows[0].total_unlent.split(' ')[0]
  var maxGetEOS = totalUnlent - 2 * totalLent / 10
  var maxSellRex = (totalUnlent - 0.1 * totalLent) * totalRex / totalLendable
  console.log('Max available sell amount of rex: ' + maxSellRex.toFixed(4) + ' REX.' + ' Equal to ' + maxGetEOS.toFixed(4) + ' EOS.')
})