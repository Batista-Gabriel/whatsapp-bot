
module.exports = {
    cloneObject(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    },

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
    async deleteInner(list, objId, func, size) {
        if (list.length <= size) {
            return await func(objId)
        }
        return false
    },

    isSameUser(id, userId) {
        return userId == id
    },
    //ut for userType
    isAdmin(ut) {
        return ut.toLowerCase() == "admin" || ut.toLowerCase() == "administrator"
    },

    getUserName(name) {

        function getRnd(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }
        let userName = name.split(" ")[0] + getRnd(10000, 99999)
        return userName
    },

    getAge(birthday, startDay) {
        var startDate = new Date(startDay)
        // var startDate = new Date();
        var birthDate = new Date(birthday);
        var age = startDate.getFullYear() - birthDate.getFullYear();
        var m = startDate.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && startDate.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
}
