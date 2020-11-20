// @flow
import React, {
  useState,
  useEffect,
  useContext,
} from 'react';
import { Helmet } from 'react-helmet';
import { w3cwebsocket as W3CWebSocket } from 'websocket';
import moment from 'moment';
import 'moment-duration-format';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';

// Component
import NetworkName from '../../components/atoms/NetworkName';
import BarChartCustom from '../../components/atoms/BarChartCustom';
import RangeSlider from '../../components/atoms/RangeSlider';
import DataTile from '../../components/molecules/DataTile';
import Map from '../../components/molecules/Map';

// Icons
import ActiveSmeshersIcon from '../../assets/icons/active-smeshers.svg';
import AccountsIcon from '../../assets/icons/accounts.svg';
import SmeshingRewardIcon from '../../assets/icons/smeshing-reward.svg';
import AgeIcon from '../../assets/icons/age.svg';
import LayerEpoch from '../../assets/icons/layer-epoch.svg';
import TxnsIcon from '../../assets/icons/txns.svg';
import CirculationIcon from '../../assets/icons/circulation.svg';
import SecurityIcon from '../../assets/icons/security.svg';
import TxnCapacityIcon from '../../assets/icons/txn-capacity.svg';
import DecentralizationRatio from '../../assets/icons/decentralization-ratio.svg';

// White Icons AccountsIconWhite
import ActiveSmeshersIconWhite from '../../assets/darkTheme/active-smeshers_white.svg';
import AccountsIconWhite from '../../assets/darkTheme/accounts_white.svg';
import SmeshingRewardIconWhite from '../../assets/darkTheme/smeshing-reward_white.svg';
import AgeIconWhite from '../../assets/darkTheme/age_white.svg';
import LayerEpochWhite from '../../assets/darkTheme/layer-epoch_white.svg';
import TxnsIconWhite from '../../assets/darkTheme/txns_white.svg';
import CirculationIconWhite from '../../assets/darkTheme/circulation_white.svg';
import SecurityIconWhite from '../../assets/darkTheme/security_white.svg';
import TxnCapacityIconWhite from '../../assets/darkTheme/txn-capacity_white.svg';
import DecentralizationRatioWhite from '../../assets/darkTheme/decentralization-ratio_white.svg';

// Context providers
import { LayoutContext } from '../../contextProviders/layoutContext';
import { byteConverter, smhCoinConverter } from '../../helpers/converter';
import { ERROR_STATUS, SYNC_STATUS, SYNCING_STATUS } from '../../config/constants';

type Props = {
  viewStore: Object,
  uiStore: Object,
}

const Home = (props: Props) => {
  const { viewStore, uiStore } = props;

  const layoutContextData = useContext(LayoutContext);
  const { checkedTheme } = layoutContextData;
  const isLightTheme = checkedTheme === 'light';

  const [data, setData] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(0);
  const network = toJS(viewStore.currentNetwork);

  const [socketClient, setSocketClient] = useState(null);

  const connect = (url) => {
    if (socketClient) {
      socketClient.close();
      setSocketClient(new W3CWebSocket(`${url}`));
    } else {
      setSocketClient(new W3CWebSocket(`${url}`));
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => connect(network.value), [network.value]);

  useEffect(() => {
    if (socketClient) {
      socketClient.onmessage = (message) => {
        const incomeData = JSON.parse(message.data);
        setData(incomeData);
        // TODO 24 it's simple num, should be getting from backend
        if ((incomeData.lastlayer + 24) < incomeData.lastapprovedlayer) {
          uiStore.setNetworkStatus(ERROR_STATUS);
        } else if (incomeData.lastlayerts < ((Math.floor(Date.now() / 1000)) - (incomeData.layerduration))) {
          uiStore.setNetworkStatus(SYNCING_STATUS);
        } else {
          uiStore.setNetworkStatus(SYNC_STATUS);
        }

        setLastUpdatedTime(1000);
      };

      socketClient.onclose = (e) => {
        uiStore.setNetworkStatus(ERROR_STATUS);
        console.log('connection is closed.', e.reason);
      };

      socketClient.onerror = (err) => {
        uiStore.setNetworkStatus(ERROR_STATUS);
        console.error('Socket encountered error: ', err.message, 'Closing socket');
      };
    }
  }, [socketClient]);

  useEffect(() => {
    const color = localStorage.getItem('theme') || 'light';
    if (color) {
      document.documentElement.classList.add(`theme-${color}`);
    } else {
      document.documentElement.classList.add('theme-light');
    }
  }, []);

  const networkName = data && data.network;

  const activeSmeshers = data && data.smeshers[data.smeshers.length - 1];
  const activeSmeshersChartData = data && data.smeshers;

  const accounts = data && data.accounts[data.accounts.length - 1];
  const accountsChartData = data && data.accounts;

  const smeshingReward = data && data.rewards[data.rewards.length - 1];
  const smeshingRewardChartData = data && data.rewards;

  const circulation = data && data.circulation[data.circulation.length - 1];
  const circulationChartData = data && data.circulation;

  const transactions = data && data.transactions[data.transactions.length - 1];
  const transactionsChartData = data && data.transactions;

  const security = data && data.security[data.security.length - 1];
  const securityChartData = data && data.security;

  const epochDuration = (data?.epochnumlayers * data?.layerduration) / 60;

  const deployConfig = {
    explorerUrl: 'https://stage-explore.spacemesh.io',
  };

  return (
    <div className="wrap">
      <Helmet>
        <title>Spacemesh Dashboard</title>
        <meta name="description" content="" />
      </Helmet>
      <div className="row pb-2">
        <div className="col-lg-12">
          <NetworkName name={networkName} age={lastUpdatedTime} uiStore={uiStore} />
        </div>
      </div>
      <div className="row">
        <div className="col-lg-3 pr-lg-2">
          <DataTile
            icon={isLightTheme ? ActiveSmeshersIcon : ActiveSmeshersIconWhite}
            title="Active Smeshers"
            url={`${deployConfig.explorerUrl}/smeshers`}
            value={activeSmeshers && activeSmeshers.amt}
            toolTipMess="Total of active smeshers in the most recent epoch. The graph displays the number of active smeshers in previous epochs. Active smeshers are deployed Spacemesh full p2p nodes that participate in the Spacemesh consensus protocol and submit blocks with transactions to the network."
            showValue
          >
            <BarChartCustom data={activeSmeshersChartData} dataMeasure="Smeshers" />
          </DataTile>
          <DataTile
            icon={isLightTheme ? AccountsIcon : AccountsIconWhite}
            title="Accounts"
            url={`${deployConfig.explorerUrl}/accounts`}
            value={accounts && accounts.amt}
            toolTipMess="Current total of number of user coin accounts on the network with a non-zero coin balance. The graph displays the total number of accounts in previous epochs."
            showValue
          >
            <BarChartCustom data={data && accountsChartData} dataMeasure="Accounts" />
          </DataTile>
          <DataTile
            icon={isLightTheme ? SmeshingRewardIcon : SmeshingRewardIconWhite}
            title="Smeshing Rewards"
            url={`${deployConfig.explorerUrl}/rewards`}
            showValue
            value={smeshingReward && smhCoinConverter(smeshingReward.amt)}
            toolTipMess="The total amount of coins awarded to smeshers since genesis. The graph displays the total rewards amount awarded to smeshers at the end of previous epochs. Smeshers are rewarded for submitting blocks with transactions to the network, for participating in the Spacemesh consensus protocol and for publishing proof of space time proofs."
          >
            <BarChartCustom data={data && smeshingRewardChartData} dataMeasure="" tooltipFilter={smhCoinConverter} />
          </DataTile>
        </div>
        <div className="col-lg-6">
          <div className="row">
            <div className="col-lg-6 pl-lg-0 pr-lg-1">
              <DataTile
                icon={isLightTheme ? AgeIcon : AgeIconWhite}
                title="Age"
                showValue
                value={data && moment.duration(data.age, 'seconds').format('d[d]:h[h]')}
                toolTipMess="The network age is the time which passed from the network went online (genesis time) until the current time."
              />
            </div>
            <div className="col-lg-6 pr-lg-0 pl-lg-1">
              <DataTile
                icon={isLightTheme ? LayerEpoch : LayerEpochWhite}
                title="Layer / Epoch"
                url={`${deployConfig.explorerUrl}`}
                showValue
                value={data && `${data.layer} / ${data.epoch}`}
                toolTipMess={`The current layer number and the current epoch number. One layer's duration is ${data?.layerduration} seconds and one epoch's duration is ${epochDuration} minutes`}
              />
            </div>
          </div>
          <div className="row pb-2">
            <div className="col-lg-12 pl-lg-0 pr-lg-0">
              <Map geoMarkers={data && data.smeshersGeo} activeSmeshers={activeSmeshers && activeSmeshers.amt} />
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6 pl-lg-0 pr-lg-1">
              <DataTile
                icon={isLightTheme ? TxnCapacityIcon : TxnCapacityIconWhite}
                title="Transactions / Second"
                toolTipMess={`The recent average transactions processed per second by the network over the network's transactions per second capacity. This indicates the current network transaction processing utilization. This network capacity is ${data?.maxcapacity} transactions per second.`}
              >
                <RangeSlider value={data && [data.capacity]} />
              </DataTile>
            </div>
            <div className="col-lg-6 pr-lg-0 pl-lg-1">
              <DataTile
                icon={isLightTheme ? DecentralizationRatio : DecentralizationRatioWhite}
                title="Decentralization Ratio"
                toolTipMess="The network degree of decentralization where 100 is highly decentralized and 0 is highly centralized. This measure factors in both the overall number of smeshers and the amount of space committed by each. A network is more decentralized if the long tail of smeshers is longer and the ratio of space committed by whales is low compared to the amount of space committed by home smeshers."
              >
                <RangeSlider value={data && [data.decentral]} />
              </DataTile>
            </div>
          </div>
        </div>
        <div className="col-lg-3 pl-lg-2">
          <DataTile
            icon={isLightTheme ? TxnsIcon : TxnsIconWhite}
            title="Transactions"
            url={`${deployConfig.explorerUrl}/txs`}
            value={transactions && transactions.amt}
            toolTipMess="The total number of transactions processed by the network since it went online (genesis time). The graph displays the total number of transactions processed by the network up to the end of previous epochs."
            showValue
          >
            <BarChartCustom data={data && transactionsChartData} dataMeasure="Transactions" />
          </DataTile>
          <DataTile
            icon={isLightTheme ? CirculationIcon : CirculationIconWhite}
            title="Circulation"
            value={circulation && smhCoinConverter(circulation.amt)}
            toolTipMess="The total amount of Smesh coins currently in circulation. This is determined by the coin rewards awarded to Smeshers as well as genesis minted coins. The graph displays the total amount in circulation at the end of previous epochs."
            showValue
          >
            <BarChartCustom data={data && circulationChartData} dataMeasure="" tooltipFilter={smhCoinConverter} />
          </DataTile>
          <DataTile
            icon={isLightTheme ? SecurityIcon : SecurityIconWhite}
            title="Security"
            value={security && byteConverter(security.amt)}
            toolTipMess="Security is measured by the total storage size committed to the network by smeshers. The bigger the number, the more storage is required by an adversary to attack the network. The number displays the amount of storage committed by all active smeshers in the previous epoch. The graph displays the amount of storage committed in previous epochs."
            showValue
          >
            <BarChartCustom data={data && securityChartData} dataMeasure="Security" tooltipFilter={byteConverter} />
          </DataTile>
        </div>
      </div>
    </div>
  );
};

export default observer(Home);
