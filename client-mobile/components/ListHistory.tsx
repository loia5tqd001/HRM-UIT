import React from 'react'
import moment from 'moment'
import { Text, View } from 'react-native'
import { ListTimeOff } from '../constants/type'


export const ListHistory = ({
  list,
}: {
  list: ListTimeOff[]
})=> {

  if (list && list.length === 0) {
    return <View><Text>No Data</Text></View>
  }

  return list.map((item: ListTimeOff, index) => {
    const color = index % 2 != 0 ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.6)'
    const start_date = moment(item.start_date).subtract(10, 'days').calendar()
    const end_date = moment(item.end_date).subtract(10, 'days').calendar()
    return (
      <View
        key={item.start_date}
        style={{
          padding: 10,
          margin: 5,
          // width: '90%',
          backgroundColor:
            index % 2 == 0 ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.6)',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color }}>{item.time_off_type}</Text>
          <Text style={{ color, fontSize: 19 }}>{item.status}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color }}>{start_date}</Text>
          <Text style={{ color }}>{end_date}</Text>
        </View>
      </View>
    )
  })
}
