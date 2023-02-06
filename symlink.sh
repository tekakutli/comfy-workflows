#!/usr/bin/env sh

#cushy-comfy workflows autosyn from several repos
#by calling: git_comfy

#add this to your .bashrc
#source <path-to-here>/comfy-workflows/symlink.sh
#and edit these variables and your repo list (inside git_comfy)

COMFY_WORKFLOWS="/home/tekakutli/Documents/workflows/"
CUSHY_WORKFLOWS="/home/tekakutli/Documents/workflows/cushy-test/"

git_comfy_loopeable(){
     cd "$repo" && git pull
     ls | grep ".json" | while read -r line; do ln -s $repo"$line" $COMFY_WORKFLOWS"$line"; done
     ls | grep ".ts" | while read -r line; do ln -s $repo"$line" $CUSHY_WORKFLOWS"$line"; done
}
git_comfy(){
     cd $COMFY_WORKFLOWS && rm *.json
     cd $CUSHY_WORKFLOWS && rm *.ts

     repo="/home/tekakutli/code/stable-diffusion/comfy-workflows/"
     git_comfy_loopeable
     # ADD MORE REPOS ...
     # repo=""
     # git_comfy_loopeable
}
