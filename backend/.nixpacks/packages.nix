{ pkgs }:

[
  (pkgs.python311.withPackages (ps: with ps; [ pip setuptools wheel ]))
]