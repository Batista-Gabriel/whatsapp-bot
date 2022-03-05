

module.exports = {

    capitalizeName(name) {

        const romanNumbers = ["i", "ii", "iii", "iv", "v"];
        let splittedName = name.split(" ")
        let newSplittedName = []
        for (let name of splittedName) {
            newSplittedName.push(name[0].toUpperCase() + name.slice(1).toLowerCase())


            let lastChars = newSplittedName[newSplittedName.length - 1];
            //if the last characters are roman numbers it gets upperCased
            if (romanNumbers.find((val) => val == lastChars.toLowerCase())) {
                newSplittedName[newSplittedName.length - 1] = lastChars.toUpperCase();

            }
        }
        return newSplittedName.join(" ")
    },


    getUserName(name) {

        function getRnd(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        let num
        do {
            num = getRnd(10000, 99999)
        } while (String(num).includes("666"))
        return name.split(" ")[0] + num
    }
}