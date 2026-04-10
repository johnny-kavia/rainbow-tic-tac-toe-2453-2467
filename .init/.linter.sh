#!/bin/bash
cd /tmp/code-generation/rainbow-tic-tac-toe-2453-2467/rainbow_tic_tac_toe_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

