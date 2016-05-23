'use strict';


var async = require('async');
var AWS = require('aws-sdk');
var BackupTask = require('./lib/BackupTask');


exports.handler = function(event, context, callback)
{
    let ec2 = new AWS.EC2({region: event.region});
    let tasks = [];
    let taskRunners = [];

    for (let i = 0, len = event.volumes.length; i < len; i++) {
        tasks[i] = new BackupTask(ec2, event.volumes[i], event.maxAge, event.snapshotDescription);
        taskRunners.push(function(callback) { tasks[i].run(callback) });
    }

    async.parallel(taskRunners, function(err, response)
    {
        if (err) {
            callback(err, 'Error(s) ocurred during backup.');
        } else {
            callback(null, 'Backup successful.');
        }
    });
}
