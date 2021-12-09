import { act } from '@testing-library/react';
import { mount } from 'enzyme';
import { observeNotifier } from '@agoric/notifier';
import Tooltip from '@mui/material/Tooltip';
import WalletConnection from '../WalletConnection';

jest.mock('@agoric/eventual-send', () => ({
  E: obj =>
    new Proxy(obj, {
      get(target, propKey) {
        const method = target[propKey];
        return (...args) => method.apply(this, args);
      },
    }),
}));

jest.mock('@agoric/wallet-connection/react.js', () => {
  return {
    makeReactAgoricWalletConnection: jest.fn(() => 'wallet-connection'),
  };
});

jest.mock('@agoric/notifier', () => {
  return {
    observeNotifier: jest.fn(),
  };
});

const setConnectionState = jest.fn();
const setInbox = jest.fn();
const setPurses = jest.fn();
const setDapps = jest.fn();
const setContacts = jest.fn();
const setPayments = jest.fn();
const setIssuers = jest.fn();
const setWalletBridge = jest.fn();
let connectionStatus = 'idle';
const withApplicationContext = (Component, _) => ({ ...props }) => {
  return (
    <Component
      setConnectionState={setConnectionState}
      connectionState={connectionStatus}
      setInbox={setInbox}
      setPurses={setPurses}
      setDapps={setDapps}
      setContacts={setContacts}
      setPayments={setPayments}
      setIssuers={setIssuers}
      setWalletBridge={setWalletBridge}
      {...props}
    />
  );
};
jest.mock('../../contexts/Application', () => {
  return { withApplicationContext };
});

describe('WalletConnection', () => {
  let component;

  beforeEach(() => {
    component = mount(<WalletConnection />);
  });

  test('dispatches the current connection state', () => {
    act(() =>
      component
        .find('wallet-connection')
        .props()
        .onState({ detail: { walletConnection: {}, state: 'connecting' } }),
    );

    expect(setConnectionState).toHaveBeenCalledWith('connecting');
  });

  test('displays the current connection status', () => {
    let connectionIndicator = component.find('.Connector').find(Tooltip);
    expect(connectionIndicator.props().title).toEqual('Disconnected');

    connectionStatus = 'bridged';
    component.setProps({ connectionStatus });
    connectionIndicator = component.find('.Connector').find(Tooltip);
    expect(connectionIndicator.props().title).toEqual('Connected');
  });

  test('resets the connection on error state', () => {
    const reset = jest.fn();

    act(() =>
      component
        .find('wallet-connection')
        .props()
        .onState({ detail: { walletConnection: { reset }, state: 'error' } }),
    );

    expect(reset).toHaveBeenCalled();
  });

  describe('on idle state', () => {
    const accessToken = 'asdf';
    const setItem = jest.fn();
    const getItem = _ => `?accessToken=${accessToken}`;
    let getOffersNotifier;
    let getPursesNotifier;
    let getDappsNotifier;
    let getContactsNotifier;
    let getPaymentsNotifier;
    let getIssuersNotifier;
    let getAdminBootstrap;

    beforeEach(() => {
      getOffersNotifier = jest.fn(() => 'mockOffersNotifier');
      getPursesNotifier = jest.fn(() => 'mockPursesNotifier');
      getDappsNotifier = jest.fn(() => 'mockDappsNotifier');
      getContactsNotifier = jest.fn(() => 'mockContactsNotifier');
      getPaymentsNotifier = jest.fn(() => 'mockPaymentsNotifier');
      getIssuersNotifier = jest.fn(() => 'mockIssuersNotifier');
      getAdminBootstrap = jest.fn(_ => ({
        getOffersNotifier,
        getPursesNotifier,
        getDappsNotifier,
        getContactsNotifier,
        getPaymentsNotifier,
        getIssuersNotifier,
      }));

      delete window.localStorage;
      window.localStorage = {
        setItem,
        getItem,
      };
    });

    describe('with an access token in the url', () => {
      beforeEach(() => {
        delete window.location;
        window.location = {
          hash: `#accessToken=${accessToken}`,
        };

        act(() =>
          component
            .find('wallet-connection')
            .props()
            .onState({
              detail: {
                walletConnection: {
                  getAdminBootstrap,
                },
                state: 'idle',
              },
            }),
        );
      });

      test('calls getAdminBootstrap with the access token', () => {
        expect(getAdminBootstrap).toHaveBeenCalledWith(accessToken);
      });

      test('clears the accessToken from the url', () => {
        expect(window.location.hash).toEqual('');
      });

      test('stores the access token in local storage', () => {
        expect(setItem).toHaveBeenCalledWith(
          'accessTokenParams',
          `?accessToken=${accessToken}`,
        );
      });

      test('updates the store with the notifier data', () => {
        expect(observeNotifier).toHaveBeenCalledWith('mockOffersNotifier', {
          updateState: setInbox,
        });
        expect(observeNotifier).toHaveBeenCalledWith('mockDappsNotifier', {
          updateState: setDapps,
        });
        expect(observeNotifier).toHaveBeenCalledWith('mockPursesNotifier', {
          updateState: setPurses,
        });
        expect(observeNotifier).toHaveBeenCalledWith('mockPaymentsNotifier', {
          updateState: setPayments,
        });
        expect(observeNotifier).toHaveBeenCalledWith('mockContactsNotifier', {
          updateState: setContacts,
        });
        expect(observeNotifier).toHaveBeenCalledWith('mockIssuersNotifier', {
          updateState: setIssuers,
        });
        expect(setWalletBridge).toHaveBeenCalledWith(getAdminBootstrap());
      });
    });

    describe('with no access token in the url', () => {
      beforeEach(() => {
        delete window.location;
        window.location = {
          hash: '',
        };
      });

      test('calls getAdminBootstrap with the access token from local storage', () => {
        const getItemSpy = jest.spyOn(window.localStorage, 'getItem');

        act(() =>
          component
            .find('wallet-connection')
            .props()
            .onState({
              detail: {
                walletConnection: {
                  getAdminBootstrap,
                },
                state: 'idle',
              },
            }),
        );

        expect(getItemSpy).toHaveBeenCalledWith('accessTokenParams');
        expect(getAdminBootstrap).toHaveBeenCalledWith(accessToken);
      });
    });
  });
});
