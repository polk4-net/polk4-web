import {Heading, TextInput, Card, CardHeader, CardBody, CardFooter, Main, DropButton, Box, Button} from 'grommet'
import React from "react";
import {Hide, View} from 'grommet-icons';

function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [reveal, setReveal] = React.useState(false);

    return (
        <Main pad="large">
            <Heading alignSelf="center">Hello!</Heading>
            <Card height="medium" width="medium" background="light-1" alignSelf="center">
                <CardBody pad="medium" >
                    <Box
                        direction="column"
                    >
                        <Box
                            direction="row"
                            margin="small"
                            align="center"
                            round="xsmall"
                            border
                        >
                            <TextInput
                                plain

                                value={email}
                                onChange={event => setEmail(event.target.value)}
                            />
                        </Box>

                        <Box
                            direction="row"
                            margin="small"
                            align="center"
                            round="xsmall"
                            border
                        >
                            <TextInput
                                plain
                                type={reveal ? 'text' : 'password'}
                                value={password}
                                onChange={event => setPassword(event.target.value)}
                            />
                            <Button
                                icon={reveal ? <View size="medium"/> : <Hide size="medium"/>}
                                onClick={() => setReveal(!reveal)}
                            />
                        </Box>
                    </Box>
                </CardBody>
                <CardFooter justify="end" pad={{horizontal: "small"}} background="light-2">
                    <Box align="center" pad="medium">
                        <Button primary label="Login" />
                    </Box>
                </CardFooter>
            </Card>
        </Main>

    );
}

export default Login;
