# sqs-toolbox

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AWS SQS toolbox is a set of tools for managing SQS messages.

**Requirements:**

- AWS provider

## Setup

## Installation

```sh
npm install -g sqs-toolbox
```

## Usage

### Command Line Interface - CLI

After installing you can run sqs-toolbox from your CLI.

#### Configuring region

sqs-toolbox will use the default region value in your AWS config file,
If it is unable to find default you will be prompted to enter region.
After the initial region setup you are always able to change it by passing it as option `-r --region <AWS_REGION>`

Example:

```sh
sqs-toolbox -r eu-central-1
```

or you can pass it along with a function call

```sh
sqs-toolbox list -r eu-central-1
```

#### Options as parameters

`-np --namePrefix`\
`-qn --queueName`\
`-sq --sourceQueue`\
`-tq --targetQueue`\
`-mm --maxMessages`\
`-re --regularExpression`\
`-mg --message`

#### Listing queues from AWS region - list

Run `list -np [devQueue]` or `list --namePrefix [devQueue]` for listing all the queues from specific region\

Example:

```sh
sqs-toolbox list --namePrefix dev
```

this will print all the queues from the given region with the name prefix `dev`, `-np --namePrefix` is a optional parameter.

#### Moving messages from one queue to another - move

Run `move --sourceName <sourceQueue> --targetName <targetQueue> --maxMessages [5]`\

Example:

```sh
sqs-toolbox move --sourceQueue firstQueue --targetQueue secondQueue --maxMessages 5
```

this will move 5 messages from `firstQueue` to `secondQueue`, `-sq --sourceQueue` and `-tq --targetQueue` are required while `-mm --maxMessages` is a optional parameter.

#### Copy messages from one queue to another - copy

Run `copy --sourceName <sourceQueue> --targetName <targetQueue> --maxMessages [5]`\

Example:

```sh
sqs-toolbox copy --sourceQueue firstQueue --targetQueue secondQueue --maxMessages 5
```

this will copy 5 messages from `firstQueue` to `secondQueue`, `-sq --sourceQueue` and `-tq --targetQueue` are required while `-mm --maxMessages` is a optional parameter.

#### Listing queues messages - peek

Run `peek --queueName <queueName> --maxMessages [5]`\

Example:

```sh
sqs-toolbox peek --queueName peekQueue --maxMessages 5
```

this will list 5 messages from `peekQueue`, `-qn --queueName` is required while `-mm --maxMessages` is a optional parameter.

#### Sending a message to queue - send

Run `send --queueName <queueName> --message <'This is the message'>`\

Example:

```sh
sqs-toolbox send --queueName sendMessageQueue --message 'This message will be sent to sendMessageQueue'
```

this will send the message to the specified queue, `-qn --queueName` and '-mg --message' are both required parameters.

#### Deleting all messages in queue - purge

Run `purge --queueName <queueName>`

Example:

```sh
sqs-toolbox purge --queueName purgeMessagesQueue
```

you will be prompted to confirm deletion, this will delete all messages in `purgeMessageQueue`, `-qn --queueName` is a required parameter.

#### Create a queue - create

Run `create --queueName <queueName>`\

Example:

```sh
sqs-toolbox create --queueName createQueue
```

this will create a queue named `createQueue`, `-qn --queueName` is a required parameter.

#### Delete a queue - delete

Run `delete --queueName <queueName>`\

Example:

```sh
sqs-toolbox delete --queueName deleteQueue
```

you will be prompted to confirm deletion, this will delete a queue named `deleteQueue`, `-qn --queueName` is a required parameter.

#### Select messages from queue - select

Run `select --queueName <queueName> --regularExpression ['expression']`\

Example:

```sh
sqs-toolbox select --queueName selectQueue --regularExpression 'test'
```

this will select all messages in which the message body satisfies the regular expression passed, then you will be prompted for further action.

![alt text](https://user-images.githubusercontent.com/18051308/87155361-1da13b00-c2bb-11ea-9c9a-ffb71bd0a289.png)

after selecting the action, and entering destination queue if needed, a list of messages appears in which we can select messages using `SPACE` tab.

![alt text](https://user-images.githubusercontent.com/18051308/87155705-b8017e80-c2bb-11ea-8d31-f872a1953d7b.png)

after selecting messages press `ENTER` to submit the action. `-qn --queueName` is required while `-re --regularExpression` is a optional parameter.

#### Help

Type `sqs-toolbox -h` for usage instructions in CLI
