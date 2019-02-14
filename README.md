# polygerrit-plugins

A set of plugins for [PolyGerrit][pg], Gerrit's web interface.

Plugin | Purpose
------ | -------
ent    | Display the hierarchy of patches pending review.
       | ![ent](share/images/old-bramble-beard-by-TheIvoryFalcon.png)
fff    | Browse the current patchset file listing by pressing F.
       | ![fff](share/images/f_letter_block_by_king_lulu_deer-dcnc98n.gif)

## Installation

_TBD_

## Development setup

You will need Docker and Node.js to be available.

Start Gerrit:

    docker-compose up

Gerrit should become available at http://localhost:8080

Build the plugin artifacts:

```shell
# one-off:
npm install && npm run build

# or, keep building:
npm install && npm start
```

Add your public SSH key to the Administrator account in the [SSH
Settings][g-sshs] panel and verify you can connect to Gerrit via SSH:

    ssh -p 29418 admin@localhost gerrit

### Accessing Gerrit over SSH

    ssh -p 29418 admin@localhost gerrit [arguments]

Or use the helper `bin/gerrit.sh` which invokes the above for you:

    bin/gerrit.sh [arguments]

### Seeding Gerrit with sample data

Install [gerrit-seed][gh-gs]:

    gem install gerrit-seed

Use the provided seed:

    gerrit-seed < share/git/banana.yml

If you want to remove the sample data, use this:

    gerrit-unseed < share/git/banana.yml

### Adding a new plugin

Clone the sample plugin `share/sample-plugin` into `src/[name]`, restart
your build runner, and start amending the source files as needed.

```shell
cp -rf share/sample-plugin src/meme &&
echo 'Gerrit.install(() => { console.log("hi!") })' >> src/meme/index.js &&
npm run build &&
open http://localhost:8080
```

Have fun!

## Credits

- [TheIvoryFalcon][da-tif] for the [Old Bramble Beard][da-obb] artwork
- [King Lulu Deer][da-kld] for the [F Letter Block][da-flb] artwork

[da-flb]: https://www.deviantart.com/king-lulu-deer/art/F-Letter-Block-764797127
[da-kld]: https://www.deviantart.com/king-lulu-deer
[da-obb]: https://www.deviantart.com/theivoryfalcon/art/Old-Bramble-Beard-636075930
[da-tif]: https://www.deviantart.com/theivoryfalcon
[g-sshs]: http://localhost:8080/settings/#SSHKeys
[gh-gs]: https://github.com/amireh/gerrit-seed
[pg]: https://www.gerritcodereview.com/dev-polygerrit.html
