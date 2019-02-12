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

Have fun!

## Credits

- [TheIvoryFalcon][da-tif] for the [Old Bramble Beard][da-obb] artwork
- [King Lulu Deer][da-kld] for the [F Letter Block][da-flb] artwork

[da-flb]: https://www.deviantart.com/king-lulu-deer/art/F-Letter-Block-764797127
[da-kld]: https://www.deviantart.com/king-lulu-deer
[da-obb]: https://www.deviantart.com/theivoryfalcon/art/Old-Bramble-Beard-636075930
[da-tif]: https://www.deviantart.com/theivoryfalcon
[pg]: https://www.gerritcodereview.com/dev-polygerrit.html