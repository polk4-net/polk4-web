import React from "react";
import {ApiPromise, WsProvider} from '@polkadot/api';
import {useState, useEffect} from "react";
import {
    Spin,
    Layout,
    Input,
    Tag,
    Typography,
    Button,
    Descriptions,
    List, Avatar
} from 'antd';

import {LoadingOutlined, CloseCircleOutlined, UserAddOutlined, SyncOutlined} from '@ant-design/icons';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import {Keyring} from '@polkadot/keyring';
import Identicon from '@polkadot/react-identicon';

const {Paragraph, Text, Title} = Typography;

function Dashboard() {
    const [api, setApi] = useState(null);
    const [loading, setLoading] = useState(true);
    const [accountBalancesLoading, setAccountBalancesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newAddress, setNewAddress] = useState('');
    const [verifyingNewAccountLoading, setVerifyingNewAccountLoading] = useState(false);
    const [newAccountBalance, setNewAccountBalance] = useState(-1);
    const [accountsWithBalances, setAccountsWithBalances] = useState([
        {
        address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
        balance: 0
    },
        {
            address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
            balance: 0
        },
        {
            address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
            balance: 0
        },
        {
            address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
            balance: 0
        },
        {
            address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
            balance: 0
        },
        {
            address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
            balance: 0
        },
        {
            address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
            balance: 0
        },
        {
            address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
            balance: 0
        },
        {
            address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
            balance: 0
        },
        {
            address: '13HyS6FJhDsttvouQ1hERXv2v6MJinPhKdHbDFp5m79K9DRj',
            balance: 0
        }
    ]);
    const [generatedAddress, setGeneratedAddress] = useState('');
    const [generatedMnemonic, setGeneratedMnemonic] = useState('');
    const [chain, setChain] = useState('');
    const [block, setBlock] = useState('');
    const [validators, setValidators] = useState([]);
    const [lastBlockHash, setLastBlockHash] = useState('');

    const antIcon = <LoadingOutlined style={{fontSize: 24}} spin/>;
    const keyring = new Keyring({type: 'sr25519', ss58Format: 2});


    const getAllAccounts = (onAccountsFetched) => {
        // eslint-disable-next-line no-undef
        if (!chrome.storage) {
            setError('We were not able to load Chrome storage context.')
            return;
        }
        // eslint-disable-next-line no-undef
        chrome.storage.local.get("accounts", function (data) {
            console.log(JSON.stringify(data.accounts))
            if (Array.isArray(data.accounts)) {
                setAccountsWithBalances([...data.accounts]);
                onAccountsFetched([...data.accounts]);
            }
        });
    };

    const deleteAccount = (account) => {
        // eslint-disable-next-line no-undef
        chrome.storage.local.get("accounts", function (data) {
            const updatedAccounts = data.accounts.filter(a => a.address !== account);
            // eslint-disable-next-line no-undef
            chrome.storage.local.set({"accounts": updatedAccounts}, function () {
                setAccountsWithBalances(updatedAccounts);
            });
            loadBalances(updatedAccounts, api);
        });
    };

    const addAccount = (account) => {
        if (!account) {
            setError(`Trying to add an empty account: ${account}`)
            return;
        }
        // eslint-disable-next-line no-undef
        if (!chrome.storage) {
            setError('We were not able to load Chrome storage context.')
            return;
        }
        const formattedAccount = {address: account, balance: 0};
        // eslint-disable-next-line no-undef
        chrome.storage.local.get("accounts", function (data) {
            const updatedAccounts = Array.isArray(data.accounts) ? [...data.accounts, formattedAccount] : [formattedAccount];
            // eslint-disable-next-line no-undef
            chrome.storage.local.set({"accounts": updatedAccounts}, function () {
                setAccountsWithBalances(updatedAccounts);
                loadBalances(updatedAccounts, api);
            });
        });
    };

    const loadBalances = async (allAccounts, api) => {
        setAccountBalancesLoading(true);
        try {
            const accountsWithBalances = [];
            for (let account of allAccounts) {
                const balance = (await api.query.system.account(account.address)).data.free;
                accountsWithBalances.push({
                    address: account.address,
                    balance
                });
            }
            setAccountsWithBalances(accountsWithBalances)
        } catch (e) {
            setError(`Error fetching balances for wallets: ${e.message}`)
        }
        setAccountBalancesLoading(false);
    };

    const setup = async () => {
        try {
            const wsProvider = new WsProvider('wss://rpc.polkadot.io');
            const api = await ApiPromise.create({provider: wsProvider});
            const chain = await api.rpc.system.chain();
            setChain(`${chain}`);
            await api.rpc.chain.subscribeNewHeads((lastHeader) => {
                setBlock(`${lastHeader.number}`);
                setLastBlockHash(`${lastHeader.hash}`);
            });
            const validators = await api.query.session.validators();
            if (validators && validators.length > 0) {
                setValidators(validators);
            }
            setValidators(validators.map(v => {
                return {
                    address: `${v}`,
                }
            }));
            setApi(api);
            setError(null);
            getAllAccounts(async (accounts) => await loadBalances(accounts, api))
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        setup();
        generateWallet();
    }, []);

    const generateWallet = () => {
        const mnemonic = mnemonicGenerate();
        const pair = keyring.addFromUri(mnemonic, {name: 'first pair'}, 'ed25519');
        setGeneratedMnemonic(mnemonic);
        setGeneratedAddress(pair.address);
    };

    const verifyNewAddress = async (address) => {
        if (address.length > 30) {
            setNewAddress(address);
            setVerifyingNewAccountLoading(true);
            try {
                const {data: {free: accountBalance}} = await api.query.system.account(address);
                setNewAccountBalance(accountBalance);
                setError(null);
            } catch (e) {
                setError(`Invalid Address: ${e.message}`);
                setNewAccountBalance(-1);
            }
        } else {
            setNewAccountBalance(-1);
        }
        setVerifyingNewAccountLoading(false)
    };

    const walletsListContainer = <div style={{overflow: 'scroll', height: 200}}>
        <List
            title="Connected wallets"
            bordered
            itemLayout="horizontal"
            dataSource={accountsWithBalances}
            renderItem={item => (
                <List.Item
                    actions={[<Button shape="circle" onClick={() => deleteAccount(item.address)} danger>x</Button>]}
                >
                    <List.Item.Meta
                        avatar={<Identicon
                            value={item.address}
                            size={50}
                            theme={'polkadot'}
                        />}
                        title={item.address}
                        description={accountBalancesLoading ? <SyncOutlined spin/> :
                            <Tag color="success">{item.balance / 10000000000} DOT</Tag>}
                    />

                </List.Item>
            )}
        />
        <Button onClick={() => loadBalances(accountsWithBalances, api)}
                style={{marginTop: 10, marginBottom: 10, width: '100%'}}
                type="primary">Refresh balances</Button>
    </div>;

    const addNewAccountContainer = <div>
        <Input placeholder="Address..."
               suffix={
                   <Button
                       disabled={verifyingNewAccountLoading || newAccountBalance < 0}
                       type="primary"
                       onClick={() => addAccount(newAddress)}
                       shape="square" icon={verifyingNewAccountLoading ?
                       <UserAddOutlined spin/> : <UserAddOutlined/>}
                       size="medium">
                       Add
                   </Button>
               }
               onChange={(event) => verifyNewAddress(event.target.value.replace(/\s/g, ''))}/>
        {
            newAccountBalance >= 0 ? <Tag style={{marginTop: 10}} color="success">Account
                    balance: {newAccountBalance / 10000000000} DOT</Tag> :
                <Tag style={{marginTop: 10}} color="error">Invalid account format</Tag>
        }
    </div>;

    const myWalletsPane = <div>
        {accountsWithBalances.length > 0 &&
        <div>
            {walletsListContainer}
        </div>
        }
        {addNewAccountContainer}
    </div>;

    const errorContainer = <div style={{padding: 5, paddingTop: 15, backgroundColor: '#ffffff'}}>
        <Paragraph>
            <Text
                strong
                style={{
                    fontSize: 16,
                }}
            >
                There was an error processing your request:
            </Text>
        </Paragraph>
        <Paragraph>
            <CloseCircleOutlined style={{color: 'red'}}/> {error}
        </Paragraph>
    </div>;

    return (
        <Layout style={{height: '100vh', backgroundColor: '#ffffff'}}>
            <div className="card-layout-content" style={{backgroundColor: '#ffffff'}}>
                {
                    loading ? <Spin indicator={antIcon}/> : <div style={{paddingTop: 10}}>
                        {myWalletsPane}
                        {
                            error && errorContainer
                        }
                    </div>
                }
            </div>
        </Layout>
    );
}

export default Dashboard;
