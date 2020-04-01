# sqs-toolbox

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AWS SQS toolbox is a set of tools for managing SQS messages.

**Requirements:**

- AWS provider

## Setup

## Installation

```sh
npm install --save-dev sqs-toolbox
```

## Usage

### Configuring region

sqs-toolbox will set region to the default region value located in you PCs AWS config
If it is unable to set the default you will be prompted to enter region

After the initial region setup you are always able to change it by passing `-r --region <AWS_REGION>`

Example:

```sh
sqs-toolbox -r eu-central-1
```

or you can pass it along with a function call

```sh
sqs-toolbox list-queues -r eu-central-1
```

### Command Line Interface - CLI

After installing you can run sqs-toolbox from your project CLI.

#### Listing queues from AWS region

Run `list-queues [name]` for listing all the queues from specific region

Example:

```sh
sqs-toolbox list-queues dev
```

this will print all the queues from the given region with the name prefix 'dev', name is optional parameter.

#### Moving messages from one queue to another

Run `move <sourceName> <targetName> [numberOfMessages]`
Example:

```sh
sqs-toolbox move firstQueue secondQueue 5
```

this will move 5 messages from 'firstQueue' to 'secondQueue'

#### Help

Type `sqs-toolbox -h` for usage instructions in CLI
