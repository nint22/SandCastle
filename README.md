SandCastle
==========

Sand Castle is a falling-sands game with AI-driven actors, implemented for HTML5 Canvas

Notes
=====

Water should be implemented with a look-ahead logic, where each game update (*not* each cell update) defines the global water movement, where instead of looking at the resulting grid, we look ahead and see if other water is going to move into our spot. Example: two water cells on the top of a T-shape of air cells. The water cell on the left wants to move right, and only right. It doesn't have to look ahead for other water cells, since they only move to the right or down. Note that during a game update loop, we not only have to decide the water's right-left preference, but also the bottom-movement (since a water cell can be above the empty air space we want to move into).
