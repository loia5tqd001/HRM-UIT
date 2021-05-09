import React from 'react'
import moment from 'moment'
import { Text, View } from 'react-native'
import { ListTimeOff } from '../constants/type'
import { ApprovedColor, pendingColor, RejectedColor } from '../constants/Colors'

export const ListHistory = ({ list }: { list: ListTimeOff[] }) => {
  
  const setColor = (text: string) => {
    if (text === 'Pending') return pendingColor
    if (text === 'Approved') return ApprovedColor
    if (text === 'Rejected') return RejectedColor
  }

  const ShowList = (list: ListTimeOff[]) => {
    return list.map((item: ListTimeOff, index) => {
      const color = setColor(item.status)

      const start_date = moment(item.start_date).subtract(10, 'days').calendar()
      const end_date = moment(item.end_date).subtract(10, 'days').calendar()

      return (
        <View
          key={item.start_date}
          style={{
            padding: 10,
            margin: 5,
            // width: '90%',
            backgroundColor: color,
            borderRadius:2
          }}
        >
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={{ color: '#0008' }}>{item.time_off_type}</Text>
            <Text style={{ color: '#0008', fontSize: 19 }}>{item.status}</Text>
          </View>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text style={{ color: '#0008' }}>{start_date}</Text>
            <Text style={{ color: '#0008' }}>{end_date}</Text>
          </View>
        </View>
      )
    })
  }
  if (list && list.length === 0) {
    return (
      <View>
        <Text>No Data</Text>
      </View>
    )
  }

  return <View>{ShowList(list)}</View>
}
