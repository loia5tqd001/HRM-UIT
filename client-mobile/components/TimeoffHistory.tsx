import moment from 'moment';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import axios from '../commons/axios';
import {
  ApprovedColor,
  CanceledColor,
  colorText,
  PendingColor,
  RejectedColor,
} from '../constants/Colors';
import { SPACING } from '../constants/Layout';
import { ListTimeOff, STATE } from '../constants/type';
import { AuthContext } from '../Context/AuthContext';

const mapColor = {
  Pending: PendingColor,
  Approved: ApprovedColor,
  Rejected: RejectedColor,
  Canceled: CanceledColor,
};

export const ListHistory = () => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [listData, setListData] = useState<ListTimeOff[]>([]);
  const [state, setState] = useState<STATE>(STATE.IDLE);
  const { user } = React.useContext(AuthContext)!;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    getListTimeOff().then(() => setRefreshing(false));
  }, []);

  const getListTimeOff = async () => {
    return axios
      .get(`/employees/${user?.id}/time_off/`)
      .then((res) => {
        setListData(res.data);
      })
      .catch((er) => {
        console.log('er', er);
      });
  };

  React.useEffect(() => {
    setState(STATE.LOADING);
    getListTimeOff().then(() => setState(STATE.LOADED));
  }, []);

  return state === STATE.LOADING ? (
    <ActivityIndicator />
  ) : (
    <FlatList<ListTimeOff>
      style={{ flexGrow: 1, width: '90%' }}
      data={listData}
      ListEmptyComponent={<Text style={{ marginTop: SPACING }}>You has no prior request ...</Text>}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => {
        const start_date = moment(item.start_date).format('DD MMM YYYY');
        const end_date = moment(item.end_date).format('DD MMM YYYY');

        return (
          <View
            style={{
              padding: SPACING,
              margin: 5,
              // width: '90%',
              backgroundColor: 'white',
              borderColor: '#e3ebf1',
              borderWidth: 1,
              borderRadius: 2,
            }}
          >
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}
            >
              <Text style={{ color: colorText, fontSize: 19 }}>{item.time_off_type}</Text>
              <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: mapColor[item.status],
                    width: SPACING / 2,
                    height: SPACING / 2,
                    borderRadius: SPACING,
                    marginRight: SPACING / 2,
                  }}
                />
                <Text style={{ color: colorText }}>{item.status}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colorText }}>
                {start_date} → {end_date}
              </Text>
            </View>
          </View>
        );
      }}
    />
  );
};
