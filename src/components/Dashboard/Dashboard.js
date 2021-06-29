import React from "react";
import {ApiPromise, WsProvider} from '@polkadot/api';
import {useState, useEffect} from "react";
import {
    Spin,
    Layout,
    Input,
    Tag,
    Typography,
    Tabs,
    Statistic,
    Popover,
    Collapse,
    Card,
    Row,
    Col,
    Timeline,
    Table,
    Button,
    Badge,
    Select,
    Modal,
    Descriptions,
    notification,
    Comment,
    Avatar
} from 'antd';
import {LoadingOutlined, CloseCircleOutlined, WarningOutlined, SendOutlined, SyncOutlined} from '@ant-design/icons';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import {Keyring} from '@polkadot/keyring';
import Identicon from '@polkadot/react-identicon';
import {web3Accounts, web3Enable, web3FromSource} from '@polkadot/extension-dapp';

const {Option} = Select;

const {Paragraph, Text} = Typography;
const {Panel} = Collapse;
const {TabPane} = Tabs;
const {Search} = Input;


function Dashboard() {
    const [api, setApi] = useState(null);
    const [transferToAccount, setTransferToAccount] = useState(null);
    const [toAccountBalance, setToAccountBalance] = useState(-1);
    const [transferFromAccount, setTransferFromAccount] = useState(null);
    const [searchAddress, setSearchAddress] = useState('');
    const [balance, setBalance] = useState('');
    const [nonce, setNonce] = useState('');
    const [chain, setChain] = useState('');
    const [block, setBlock] = useState('');
    const [amountToSend, setAmountToSend] = useState(0);
    const [validators, setValidators] = useState([]);
    const [lastBlockHash, setLastBlockHash] = useState('');
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [verifyingToAccountLoading, setVerifyingToAccountLoading] = useState(false);
    const [accountBalancesLoading, setAccountBalancesLoading] = useState(false);
    const [transactionPending, setTransactionPending] = useState(false);
    const [transactionInProgress, setTransactionInProgress] = useState(false);
    const [error, setError] = useState(null);
    const [generatedAddress, setGeneratedAddress] = useState('');
    const [generatedMnemonic, setGeneratedMnemonic] = useState('');
    const [accounts, setAccounts] = useState([]);

    const antIcon = <LoadingOutlined style={{fontSize: 24}} spin/>;
    const keyring = new Keyring({type: 'sr25519', ss58Format: 2});

    const openNotification = (message, description) => {
        notification.open({
            message,
            description
        });
    };

    const confirmTransaction = async () => {
        setTransactionInProgress(true);
        const transferExtrinsic = api.tx.balances.transfer(transferToAccount, amountToSend);
        const injector = await web3FromSource(accounts.filter(a => a.address === transferFromAccount)[0].meta.source);
        transferExtrinsic.signAndSend(transferFromAccount, {signer: injector.signer}, ({status}) => {
            if (status.isInBlock) {
                openNotification('Success!', `Completed at block hash #${status.asInBlock.toString()}`);
                setTransactionInProgress(false);
                setTransactionPending(false);
            } else {
                openNotification('Current status:', `${status.type}`);
                loadBalances(accounts, api);
            }
        }).catch((error) => {
            setError(`Transaction failed: ${error.message}`);
            setTransactionInProgress(false);
            setTransactionPending(false);
        });

    };

    const verifyToAddress = async (address) => {
        if (address.length > 30) {
            setTransferToAccount(address);
            setVerifyingToAccountLoading(true);
            try {
                const {data: {free: accountBalance}} = await api.query.system.account(address);
                setToAccountBalance(accountBalance);
                setError(null);
            } catch (e) {
                setError(`Invalid receiver Address: ${e.message}`);
                setToAccountBalance(-1);
            }
        } else {
            setToAccountBalance(-1);
        }
        setVerifyingToAccountLoading(false)
    };

    const extensionSetup = async (api) => {
        const extensions = await web3Enable('Polk4NET');
        if (extensions.length === 0) {
            openNotification('PolkadotJS extension missing', 'Please install PolkadotJS extension and add your wallets to unlock all features!');
            return;
        }
        const allAccounts = await web3Accounts();
        setAccounts(allAccounts);
        await loadBalances(allAccounts, api);
    };

    const loadBalances = async (allAccounts, api) => {
        setAccountBalancesLoading(true);
        try {
            const accountsWithBalances = [];
            for (let account of allAccounts) {
                const balance = (await api.query.system.account(account.address)).data.free;
                accountsWithBalances.push({
                    address: account.address,
                    meta: account.meta,
                    balance
                });
            }
            setAccounts(accountsWithBalances)
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
            await extensionSetup(api);
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        setup();
        generateWallet();
    }, []);

    const search = async () => {
        setError(null);
        setSearching(true);
        try {
            let {data: {free: previousFree}, nonce: previousNonce} = await api.query.system.account(searchAddress);
            setNonce(`${previousNonce}`);
            setBalance(`${previousFree}`);
        } catch (e) {
            setError(e.message);
        }
        setSearching(false);
    };

    const generateWallet = () => {
        const mnemonic = mnemonicGenerate();
        const pair = keyring.addFromUri(mnemonic, {name: 'first pair'}, 'ed25519');
        setGeneratedMnemonic(mnemonic);
        setGeneratedAddress(pair.address);
    };

    const networkPane = <TabPane tab="Network" key="1">
        <Row gutter={16} style={{paddingTop: 10}}>
            <Col span={24}>
                <Card>
                    <Timeline pending="Last block...">
                        <Timeline.Item>{block} - {lastBlockHash}</Timeline.Item>
                    </Timeline>
                </Card>
            </Col>
        </Row>
        <Badge.Ribbon text="Canvas test network [expect chaos]">
            <Card style={{ backgroundColor: 'black', color: 'white', fontStyle: 'bold'}}>wss://canvas.polk4.net</Card>
        </Badge.Ribbon>
    </TabPane>;

    const walletExplorerPane = <TabPane tab="Wallet Explorer" key="2">
        <Search placeholder="15huYREoovwL5XCmJ9QHr1xXk5rax2G7rNs7z4gPWWDhtiGD"
                enterButton="Search"
                size="large"
                disabled={searching}
                onChange={(event) => setSearchAddress(event.target.value)} onSearch={search}
                searching={searching}/>
        {balance && <div style={{paddingTop: 10}}>
            <Row gutter={16}>
                <Col span={24}>
                    <Card>
                        <Statistic
                            title="Nonce"
                            value={nonce}
                            precision={2}
                        />
                        <Statistic
                            style={{paddingTop: 10}}
                            title="Balance"
                            value={balance / 10000000000}
                            precision={2}
                            suffix="DOT"
                        />
                    </Card>
                </Col>
            </Row>
        </div>}
    </TabPane>;

    const generateWalletPane = <TabPane tab="Generate Wallet" key="3">
        <div className="card-layout-content-white">
            <Button onClick={generateWallet} type="primary">Generate new wallet</Button>
            {
                generatedAddress && <div style={{paddingTop: 10}}>
                    <Descriptions title="New wallet details" bordered>
                        <Descriptions.Item label="Mnemonic" span={3}>
                            <div
                                style={{paddingTop: 10}}>{generatedMnemonic.split(' ').map(word =>
                                <Tag>{word}</Tag>)}</div>
                        </Descriptions.Item>
                        <Descriptions.Item label="Address" span={3}>
                            <Tag color="success">{generatedAddress}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Identicon" span={3}>
                            <Identicon
                                value={generatedAddress}
                                size={80}
                                theme={'polkadot'}
                            />
                        </Descriptions.Item>
                    </Descriptions>
                </div>
            }
            <Paragraph style={{paddingTop: 10}}>
                <WarningOutlined style={{color: 'orange'}}/> Remember: mnemonic (12 words
                generated above) is the only way you can access your wallet. Store it offline
                and never share with anyone. Polk4.net never stores generated
                addresses/mnemonics.
            </Paragraph>
            <Paragraph style={{paddingTop: 10}}>
                <WarningOutlined style={{color: 'orange'}}/> For better security turn this page
                to offline mode and regenerate mnemonic once you are done.
            </Paragraph>
        </div>
    </TabPane>;

    const connectExtensionContainer = <div className="card-layout-content-white">
        <Button onClick={extensionSetup} type="primary">Connect PolkaJS extension to this
            platform.</Button>
    </div>;

    const walletsListContainer = <div className="card-layout-content-white">
        <Descriptions title="Connected wallets" bordered>{
            accounts.map(account => <Descriptions.Item
                label={`${account.meta.name}`}
                span={3}>
                {`${account.address} `}
                {accountBalancesLoading ? <SyncOutlined spin/> :
                    <Tag color="success">{account.balance / 10000000000} DOT</Tag>}
            </Descriptions.Item>)
        }
        </Descriptions>
        <Button onClick={() => loadBalances(accounts, api)} style={{marginTop: 10}}
                type="primary">Refresh balances</Button>
    </div>;

    const transactionConfirmationModal = <Modal title="Confirm transaction" visible={transactionPending}
                                                onOk={confirmTransaction}
                                                closable={false}
                                                maskClosable={false}
                                                okButtonProps={{disabled: transactionInProgress}}
                                                cancelButtonProps={{disabled: transactionInProgress}}
                                                onCancel={() => setTransactionPending(false)}>
        <Spin tip="Processing transaction..." spinning={transactionInProgress}>
            <Paragraph>
                <Text
                    style={{
                        fontSize: 16,
                    }}
                >
                    You are sending {<Tag
                    color="green">{amountToSend / 10000000000} DOT</Tag>}
                    from {<Tag color="yellow">{transferFromAccount}</Tag>}
                    <p>to</p> {
                    <Tag color="yellow">{transferToAccount}</Tag>}
                    <p> Are you sure you want to proceed? </p></Text>
            </Paragraph>
        </Spin>
    </Modal>;

    const transferContainer = <div className="card-layout-content-white" style={{marginTop: 10}}>
        <Descriptions title="Transfer" bordered>
            <Descriptions.Item
                label="Amount"
                span={1}>
                <Input placeholder="0" type="number"
                       onChange={(event) => setAmountToSend(event.target.value * 10000000000)}/>
            </Descriptions.Item>
            <Descriptions.Item
                label="From"
                span={1}>
                <Select
                    defaultValue={`${accounts.length > 0 ? accounts[0].address : '...'}`}
                    onChange={(account) => setTransferFromAccount(account)}>
                    {
                        accounts.map(account => <Option
                            value={`${account.address}`}>{`${account.address}`}</Option>)
                    }
                </Select>
            </Descriptions.Item>
            <Descriptions.Item
                label="To"
                span={1}>
                <Input placeholder="To Address..."
                       suffix={
                           <Button
                               disabled={toAccountBalance < 0 || verifyingToAccountLoading}
                               type="primary"
                               onClick={() => {
                                   if (!transferFromAccount && accounts.length > 0) {
                                       setTransferFromAccount(accounts[0].address);
                                   }
                                   setTransactionPending(true);
                                   setError(null)
                               }}
                               shape="square" icon={verifyingToAccountLoading ?
                               <SyncOutlined spin/> : <SendOutlined/>}
                               size="medium">
                               Send
                           </Button>
                       }
                       onChange={(event) => verifyToAddress(event.target.value.replace(/\s/g, ''))}/>
                {toAccountBalance >= 0 &&
                <Tag style={{marginTop: 10}} color="success">Receiver account
                    balance: {toAccountBalance / 10000000000} DOT</Tag>}
            </Descriptions.Item>
        </Descriptions>
        {transactionConfirmationModal}
    </div>;

    const myWalletsPane = <TabPane tab={<Badge count={accounts ? accounts.length : 0} offset={[13, 7]}>
        <span>My wallet</span>
    </Badge>} key="4">
        {accounts.length <= 0 ? connectExtensionContainer :
            <div>
                {walletsListContainer}
                {transferContainer}
            </div>
        }
    </TabPane>;

    const errorContainer = <div style={{padding: 5, paddingTop: 15}}>
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
        <Layout style={{height: '100vh', backgroundColor: '#ececec'}}>
            <div className="card-layout-content">
                {
                    loading ? <Spin indicator={antIcon}/> : <div style={{paddingTop: 10}}>
                        <Tabs defaultActiveKey="1" onChange={() => setError(null)}>
                            {networkPane}
                            {walletExplorerPane}
                            {generateWalletPane}
                            {myWalletsPane}
                        </Tabs>
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
