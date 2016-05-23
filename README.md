# Automated backup for EC2 volumes

This script makes it easy to run automated backups for EC2 volumes within
Amazon Web Services. The script may either be triggered directly
(e.g. via crontab) or within AWS Lambda.

## Run manually

Copy *conf.js.dist* to *conf.js* and define which volumes to back up.

Make sure you’ve valid AWS credentials within ~/.aws and run

```Shell
nvm use
npm i
npm start
```


## Create Lambda deployment package

Ensure zip CLI is installed and run

```Shell
npm run-script build
```

This creates *ec2-backup.zip* in your project’s directory, which you can
directly upload to AWS Lambda.


## AWS Lambda configuration

Run in Lambda supplying the following config and modify if needed:

```JSON
{
    "region": "eu-central-1",
    "maxAge": 30,
    "snapshotDescription": "Automated backup",
    "volumes": [
        "fist-volume-id",
        "second-volume-id",
        "third-volume-id"
    ]
}
```
