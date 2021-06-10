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
    Descriptions
} from 'antd';
import {LoadingOutlined, CloseCircleOutlined, WarningOutlined} from '@ant-design/icons';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import {Keyring} from '@polkadot/keyring';
import Identicon from '@polkadot/react-identicon';

const {Paragraph, Text} = Typography;
const {Panel} = Collapse;
const {TabPane} = Tabs;
const {Content} = Layout;
const {Search} = Input;


function Dashboard() {
    const [api, setApi] = useState(null);
    const [searchAddress, setSearchAddress] = useState('');
    const [balance, setBalance] = useState('');
    const [nonce, setNonce] = useState('');
    const [chain, setChain] = useState('');
    const [block, setBlock] = useState('');
    const [validators, setValidators] = useState([]);
    const [lastBlockHash, setLastBlockHash] = useState('');
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [generatedAddress, setGeneratedAddress] = useState('');
    const [generatedMnemonic, setGeneratedMnemonic] = useState('');

    const antIcon = <LoadingOutlined style={{fontSize: 24}} spin/>;
    const keyring = new Keyring({type: 'sr25519', ss58Format: 2});

    useEffect(() => {
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
            } catch (e) {
                setError(e.message);
            }
            setLoading(false);
        };
        setup();
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
    }

    const generateWallet = () => {
        const mnemonic = mnemonicGenerate();
        const pair = keyring.addFromUri(mnemonic, {name: 'first pair'}, 'ed25519');
        setGeneratedMnemonic(mnemonic);
        setGeneratedAddress(pair.address);
    };

    const columns = [
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: text => <Popover content={<p>{text}</p>} title="Address" trigger="click">
                <a>{text ? text.substring(0, 10) : ''}... (click to reveal full address)</a>
            </Popover>
        }
    ]
    return (
        <Layout>
            <div className="card-layout-content" style={{height: '100vh'}}>
                {
                    loading ? <Spin indicator={antIcon}/> : <div style={{paddingTop: 10}}>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Network" key="1">
                                <Row gutter={16} style={{paddingTop: 10}}>
                                    <Col span={24}>
                                        <Card>
                                            <Timeline pending="Last block...">
                                                <Timeline.Item>{block} - {lastBlockHash}</Timeline.Item>
                                            </Timeline>
                                        </Card>
                                    </Col>
                                </Row>
                                <Collapse style={{paddingTop: 5}}>
                                    <Panel header="Validators" key="1">
                                        <Table dataSource={validators} columns={columns}/>
                                    </Panel>
                                </Collapse>
                            </TabPane>
                            <TabPane tab="Wallet Explorer" key="2">
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
                            </TabPane>
                            <TabPane tab="Generate Wallet" key="3">
                                <div className="card-layout-content-white">
                                    <Button onClick={generateWallet} type="primary">Generate new wallet</Button>
                                    {
                                        generatedAddress && <div style={{paddingTop: 10}}>
                                            <Descriptions title="New wallet details" bordered>
                                                <Descriptions.Item label="Mnemonic" span={3}>
                                                    <div style={{paddingTop: 10}}>{generatedMnemonic.split(' ').map(word =>
                                                        <Tag>{word}</Tag>)}</div>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Address" span={3}>
                                                    <Tag color="success" >{generatedAddress}</Tag>
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
                                        <WarningOutlined style={{ color: 'orange' }} /> Remember: mnemonic (12 words generated above) is the only way you can access your wallet. Store it offline and never share with anyone. Polk4.net never stores generated addresses/mnemonics.
                                    </Paragraph>
                                    <Paragraph style={{paddingTop: 10}}>
                                        <WarningOutlined style={{ color: 'orange' }} /> For better security turn this page to offline mode and regenerate mnemonic once you are done.
                                    </Paragraph>
                                </div>
                            </TabPane>
                        </Tabs>
                        {
                            error && <div style={{padding: 5, paddingTop: 15}}>
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
                            </div>
                        }
                    </div>
                }
            </div>
        </Layout>
    );
}

export default Dashboard;
