import React from "react";
import {ApiPromise, WsProvider} from '@polkadot/api';
import {useState, useEffect} from "react";
import {Spin, Layout, Input, Typography, Statistic, Popover, Collapse, Card, Row, Col, Timeline, Table, notification} from 'antd';
import {LoadingOutlined, CloseCircleOutlined} from '@ant-design/icons';
const { Paragraph, Text } = Typography;
const { Panel } = Collapse;

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

    const antIcon = <LoadingOutlined style={{fontSize: 24}} spin/>;

    const openNotification = () => {
        notification.open({
            message: 'PolkaDOT is loading...',
            duration: 5,
            description:
                'Please, be patient - application is connecting to main-net RPC.',
        });
    };

    useEffect(() => {
        const setup = async () => {
            openNotification();
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

    const columns = [
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
            render: text =>  <Popover content={<p>{text}</p>} title="Address" trigger="click">
                <a>{text ? text.substring(0, 10) : ''}... (click to reveal full address)</a>
            </Popover>
        }
    ]
    return (
        <Layout>
                <div className="card-layout-content" style={{ height: '100vh'}}>
                    {
                        loading ? <Spin indicator={antIcon}/> : <div style={{paddingTop: 10}}>
                            <Search placeholder="15huYREoovwL5XCmJ9QHr1xXk5rax2G7rNs7z4gPWWDhtiGD" enterButton="Search"
                                    size="large"
                                    disabled={searching}
                                    onChange={(event) => setSearchAddress(event.target.value)} onSearch={search}
                                    searching={searching}/>
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
                                <Panel header="Validators" key="1" >
                                    <Table dataSource={validators} columns={columns} />
                                </Panel>
                            </Collapse>
                            {
                                error && <div style={{ padding: 5, paddingTop: 15 }}>
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
                                        <CloseCircleOutlined style={{ color: 'red' }} /> {error}
                                    </Paragraph>
                                </div>
                            }
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
                        </div>
                    }
                </div>
        </Layout>
    );
}

export default Dashboard;
