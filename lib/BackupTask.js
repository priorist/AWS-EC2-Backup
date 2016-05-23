'use strict';

var async = require('async');


function BackupTask(ec2, volume, maxAge, snapshotDescription)
{
    this.ec2 = ec2;
    this.volume = volume;
    this.maxAge = maxAge;
    this.snapshotDescription = snapshotDescription || 'Automated backup';
}


BackupTask.prototype.run = function run(callback)
{
    this.createSnapshot(this.volume, (function(err, data)
    {
        if (err) {
            callback(err);
        } else {
            console.log('Created snapshot ' + data.SnapshotId);
            this.deleteOldSnapshots(callback);
        }
    }).bind(this));
}


BackupTask.prototype.deleteOldSnapshots = function deleteOldSnapshots(callback)
{
    let params = {
        DryRun: false,
        Filters: [
            {
                Name: 'volume-id',
                Values: [this.volume]
            }
        ]
    };

    this.ec2.describeSnapshots(params, (function(err, data)
    {
        if (err) {
            callback(err);
        } else {
            let deleteCalls = [];

            for (let i = 0, len = data.Snapshots.length; i < len; i++) {
                let created = new Date(data.Snapshots[i].StartTime).getTime();
                let snapshotAge = (Date.now() - created) / 1000 / 60 / 60 / 24;

                if (snapshotAge >= this.maxAge) {
                    console.log('Deleting snapshot ' + data.Snapshots[i].SnapshotId + ' because it is older than ' + this.maxAge + ' days');
                    deleteCalls.push((function(callback) {this.deleteSnapshot(data.Snapshots[i].SnapshotId, callback)}).bind(this));
                }
            }

            async.parallel(deleteCalls, callback);
        }
    }).bind(this));
}


BackupTask.prototype.deleteSnapshot = function deleteSnapshot(id, callback)
{
    let params = {
        SnapshotId: id,
        DryRun: false
    };

    this.ec2.deleteSnapshot(params, callback);
}


BackupTask.prototype.createSnapshot = function createSnapshot(volume, callback)
{
    let params = {
        VolumeId: volume,
        Description: this.snapshotDescription,
        DryRun: false
    };

    console.log('Creating snapshot for volume ' + this.volume);

    this.ec2.createSnapshot(params, callback);
}


module.exports = BackupTask;
