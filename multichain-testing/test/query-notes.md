
### Helpful Queries
kubectl exec -i gaialocal-genesis-0 -c validator --tty=false -- gaiad query txs --query "message.action='/ibc.core.channel.v1.MsgRecvPacket'" | jq

MsgAcknowledgement

kubectl exec -i agoriclocal-genesis-0 -c validator --tty=false -- agd query txs --events message.action=/ibc.core.channel.v1.MsgRecvPacket


kubectl exec -i agoriclocal-genesis-0 -c validator --tty=false -- agd query txs --events write_acknowledgement.packet_src_port=transfer 

kubectl exec -i agoriclocal-genesis-0 -c validator --tty=false -- agd query txs --events recv_packet.packet_src_port=transfer


kubectl exec -i agoriclocal-genesis-0 -c validator --tty=false -- agd query txs --events send_packet.packet_src_port=transfer


## Expected Flow

1. Originator: send_packet
2. Relayer: turns it into MsgReceievePacket (osmosis-agoric relayer)
3. Agoric: makes another send_packet
4. Relayer: turns it into MsgReceievePacket (agoric-gaia relayer)
5. Gaia receives packet
6. Destination (gaia): write_acknowledgement
7. Relayer: turns it into MsgAcknowledgement (agoric-gaia relayer)
8. (agoric): write_acknowledgement
9. Relayer: turns it into MsgAcknowledgement (osmosis-agoric relayer)
10. osmosis transfer app gets the acknowledgement


TODO: write a script that gets the counts / events before and after each action

Example:

```json

{
  "type": "write_acknowledgement",
  "attributes": [
    {
      "key": "cGFja2V0X2RhdGE=",
      "value": "eyJhbW91bnQiOiI1MCIsImRlbm9tIjoidHJhbnNmZXIvY2hhbm5lbC0xL3VibGQiLCJtZW1vIjoiJ3tcImZvcndhcmRcIjp7XCJjaGFubmVsXCI6XCJjaGFubmVsLTFcIixcInBvcnRcIjpcInRyYW5zZmVyXCIsXCJyZWNlaXZlclwiOlwiY29zbW9zMTZ2NnNtejlwZzlwejdzcng4d2xkbnB6Z2czbWZ6eHA3OHMwd3Z0XCIsXCJyZXRyaWVzXCI6MixcInRpbWVvdXRcIjpcIjFtXCJ9fSciLCJyZWNlaXZlciI6ImFnb3JpYzF1am1rMDQ5Mm1hdXEyZjJ2cmNuN3lscTN3M3g1NWswYXA5bXQycCIsInNlbmRlciI6Im9zbW8xODcwdGV3N2Y0NGhwM3Z1MDdncWtyZXM1cnJ6Z3NhNmtzZnE3NW0ifQ==",
      "index": true
    },
    {
      "key": "cGFja2V0X2RhdGFfaGV4",
      "value": "N2IyMjYxNmQ2Zjc1NmU3NDIyM2EyMjM1MzAyMjJjMjI2NDY1NmU2ZjZkMjIzYTIyNzQ3MjYxNmU3MzY2NjU3MjJmNjM2ODYxNmU2ZTY1NmMyZDMxMmY3NTYyNmM2NDIyMmMyMjZkNjU2ZDZmMjIzYTIyMjc3YjVjMjI2NjZmNzI3NzYxNzI2NDVjMjIzYTdiNWMyMjYzNjg2MTZlNmU2NTZjNWMyMjNhNWMyMjYzNjg2MTZlNmU2NTZjMmQzMTVjMjIyYzVjMjI3MDZmNzI3NDVjMjIzYTVjMjI3NDcyNjE2ZTczNjY2NTcyNWMyMjJjNWMyMjcyNjU2MzY1Njk3NjY1NzI1YzIyM2E1YzIyNjM2ZjczNmQ2ZjczMzEzNjc2MzY3MzZkN2EzOTcwNjczOTcwN2EzNzczNzI3ODM4Nzc2YzY0NmU3MDdhNjc2NzMzNmQ2NjdhNzg3MDM3Mzg3MzMwNzc3Njc0NWMyMjJjNWMyMjcyNjU3NDcyNjk2NTczNWMyMjNhMzIyYzVjMjI3NDY5NmQ2NTZmNzU3NDVjMjIzYTVjMjIzMTZkNWMyMjdkN2QyNzIyMmMyMjcyNjU2MzY1Njk3NjY1NzIyMjNhMjI2MTY3NmY3MjY5NjMzMTc1NmE2ZDZiMzAzNDM5MzI2ZDYxNzU3MTMyNjYzMjc2NzI2MzZlMzc3OTZjNzEzMzc3MzM3ODM1MzU2YjMwNjE3MDM5NmQ3NDMyNzAyMjJjMjI3MzY1NmU2NDY1NzIyMjNhMjI2ZjczNmQ2ZjMxMzgzNzMwNzQ2NTc3Mzc2NjM0MzQ2ODcwMzM3Njc1MzAzNzY3NzE2YjcyNjU3MzM1NzI3MjdhNjc3MzYxMzY2YjczNjY3MTM3MzU2ZDIyN2Q=",
      "index": true
    },
    {
      "key": "cGFja2V0X3RpbWVvdXRfaGVpZ2h0",
      "value": "MC00NzU2",
      "index": true
    },
    {
      "key": "cGFja2V0X3RpbWVvdXRfdGltZXN0YW1w",
      "value": "MTczNjk5NDA4Mzc1MTgwMjk4Ng==",
      "index": true
    },
    {
      "key": "cGFja2V0X3NlcXVlbmNl",
      "value": "NA==",
      "index": true
    },
    {
      "key": "cGFja2V0X3NyY19wb3J0",
      "value": "dHJhbnNmZXI=",
      "index": true
    },
    {
      "key": "cGFja2V0X3NyY19jaGFubmVs",
      "value": "Y2hhbm5lbC0x",
      "index": true
    },
    {
      "key": "cGFja2V0X2RzdF9wb3J0",
      "value": "dHJhbnNmZXI=",
      "index": true
    },
    {
      "key": "cGFja2V0X2RzdF9jaGFubmVs",
      "value": "Y2hhbm5lbC0w",
      "index": true
    },
    {
      "key": "cGFja2V0X2Fjaw==",
      "value": "eyJyZXN1bHQiOiJBUT09In0=",
      "index": true
    },
    {
      "key": "cGFja2V0X2Fja19oZXg=",
      "value": "N2IyMjcyNjU3Mzc1NmM3NDIyM2EyMjQxNTEzZDNkMjI3ZA==",
      "index": true
    },
    {
      "key": "cGFja2V0X2Nvbm5lY3Rpb24=",
      "value": "Y29ubmVjdGlvbi0w",
      "index": true
    }
  ]
}
```
