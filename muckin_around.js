var BTCNetwork = require('btc-p2p').BTCNetwork
  , network    = new BTCNetwork()
  , logfmt     = require('logfmt')
  , totals     = {}
  , peers      = 1

network.on('transactionInv', function(data){
  hex = data.hash.toString('hex')
  ip  = data.peer.host.host
  if (totals[hex]) {
    if (totals[hex].indexOf(ip) < 0) totals[hex].push(ip)
    if (peers < totals[hex].length) peers = totals[hex].length
  } else {
    totals[hex] = [ip]
  }
  logfmt.log({
    'tx':      hex,
    'nodes':   totals[hex].length,
    'percent_of_nodes': Math.round((totals[hex].length / peers) * 100) + '%'
  })
})

network.on('peerStatus', function(data) {
  peers = data.numActive
})

network.on('error', function(data){
  logfmt.log({error: data.message})
})

process.once('SIGINT', function(){
  network.shutdown()
  process.exit(0)
})

network.options.minPeers = process.env.minPeers || 20;
network.options.maxPeers = process.env.maxPeers || 3000;

network.launch()
