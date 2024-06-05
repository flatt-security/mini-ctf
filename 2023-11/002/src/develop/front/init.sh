if [ ! -d "/app/frontend/node_modules" ]; then
    pushd /app
    npm create vite frontend -- --template react-ts -y
    pushd /app/frontend
        npm install aws-amplify 
        npm install aws-amplify-react 
        npm install react-router-dom 
        npm install axios 
        npm install recoil
        npm install @aws-amplify/ui-react
        npm install --save-dev @types/react-router-dom
        npm install --save-dev @types/axios 
        npm install --save-dev eslint 
        npm install --save-dev @typescript-eslint/parser 
        npm install --save-dev @typescript-eslint/eslint-plugin 
        npm install --save-dev eslint-config-prettier 
        npm install --save-dev prettier
        npm run build
    popd
    popd
fi
