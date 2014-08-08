/* jslint node: true */
"use strict";

var FS = require('fs'),
    chai = require('chai'),
    sinon = require('sinon'),
    expect = require('chai').expect;

var FileWatcher = require('../src/backend/modules/file_watcher');

describe('File Watcher', function () {

    after(function (done) {
        FS.unlinkSync(__dirname + '/test_example.txt');
        done();
    });

    describe('#getWatchDirectory()', function () {
        it('should get the directory that was set', function () {
            FileWatcher.setOptions({ watchDir: __dirname });
            expect(FileWatcher.getWatchDirectory()).to.eql(__dirname);
        });
    });

    describe('#watchDir()', function () {
        it('should throw an error if there was no watch directory defined', function () {
            FileWatcher.setOptions({});
            expect(function () {
                FileWatcher.watchDir();
            }).to.throw(/Watch directory not defined/);
        });

        it('should watch for files', function (done) {
            this.timeout(5000);
            var spy = sinon.spy();

            FileWatcher.setOptions({ watchDir: __dirname });
            FileWatcher.attachCallback(spy);

            FS.openSync(__dirname + '/test_example.txt', 'w');

            setTimeout(function () {
                expect(spy.called).to.be.true;
                done();
            },1000);
        });
    });
});
