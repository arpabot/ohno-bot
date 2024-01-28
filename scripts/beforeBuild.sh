VERSION=$(node -e "_=require(\"./package.json\");console.log(_.version)")

mv src/common/version.ts src/common/version

echo "export const version = \"$VERSION\";\n" >> src/common/version.ts