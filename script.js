const home = document.getElementById("home");
const reportPage = document.getElementById("reportPage");
const report = document.getElementById("report");
const loading = document.getElementById("loading");
const addCarPage = document.getElementById("addCarPage");


// ================================
// التنقل بين الصفحات
// ================================

function openReport() {

    home.classList.add("hidden");
    addCarPage.classList.add("hidden");
    reportPage.classList.remove("hidden");

}


function openAddCar() {

    home.classList.add("hidden");
    reportPage.classList.add("hidden");
    addCarPage.classList.remove("hidden");

    displayCars();

}


function goHome() {

    reportPage.classList.add("hidden");
    addCarPage.classList.add("hidden");

    home.classList.remove("hidden");

    report.classList.add("hidden");

    updateStatistics();

}


// ================================
// حساب السيارة
// ================================

function addAndCalculate() {

    const name =
        document.getElementById("carName").value.trim();

    const year =
        Number(document.getElementById("carYear").value);

    const buyPrice =
        Number(document.getElementById("buyPrice").value);

    const shipping =
        Number(document.getElementById("shipping").value);

    const repair =
        Number(document.getElementById("repair").value);

    const otherCost =
        Number(document.getElementById("otherCost").value);

    const salePrice =
        Number(document.getElementById("salePrice").value);


    // التحقق

    if (!name) {

        alert("⚠️ اكتب اسم السيارة");

        return;
    }

    if (!year) {

        alert("⚠️ اكتب سنة السيارة");

        return;
    }

    if (buyPrice <= 0) {

        alert("⚠️ اكتب سعر الشراء");

        return;
    }

    if (salePrice <= 0) {

        alert("⚠️ اكتب سعر البيع");

        return;
    }


    // الحساب

    const totalCost =
        buyPrice +
        shipping +
        repair +
        otherCost;

    const profit =
        salePrice -
        totalCost;


    // إنشاء السيارة

    const car = {

        id: Date.now(),

        name: name,

        year: year,

        buyPrice: buyPrice,

        shipping: shipping,

        repair: repair,

        otherCost: otherCost,

        totalCost: totalCost,

        salePrice: salePrice,

        profit: profit

    };


    // جلب السيارات القديمة

    let cars =
        JSON.parse(
            localStorage.getItem("carcost_cars")
        ) || [];


    // إضافة السيارة

    cars.push(car);


    // حفظ

    localStorage.setItem(
        "carcost_cars",
        JSON.stringify(cars)
    );


    // إظهار رسالة

    alert("✅ تمت إضافة السيارة بنجاح");


    // تنظيف الحقول

    document.getElementById("carName").value = "";
    document.getElementById("carYear").value = "";
    document.getElementById("buyPrice").value = "";
    document.getElementById("shipping").value = "";
    document.getElementById("repair").value = "";
    document.getElementById("otherCost").value = "";
    document.getElementById("salePrice").value = "";


    // تحديث القائمة

    displayCars();

    updateStatistics();

}


// ================================
// عرض السيارات
// ================================

function displayCars() {

    const carsList =
        document.getElementById("carsList");


    let cars =
        JSON.parse(
            localStorage.getItem("carcost_cars")
        ) || [];


    if (cars.length === 0) {

        carsList.innerHTML =
            "لا توجد سيارات مضافة.";

        return;
    }


    carsList.innerHTML =
        cars.map(function(car, index) {

            return `

                <div class="car-item">

                    <h3>
                        🚗 ${car.name}
                    </h3>

                    <div class="car-info">

                        <div>
                            السنة
                            <strong>
                                ${car.year}
                            </strong>
                        </div>

                        <div>
                            التكلفة
                            <strong>
                                ${formatMoney(car.totalCost)}
                            </strong>
                        </div>

                        <div>
                            البيع
                            <strong>
                                ${formatMoney(car.salePrice)}
                            </strong>
                        </div>

                        <div>
                            الربح
                            <strong>
                                ${formatMoney(car.profit)}
                            </strong>
                        </div>

                    </div>

                    <button
                        class="delete-button"
                        onclick="deleteCar(${car.id})">

                        🗑️ حذف السيارة

                    </button>

                </div>

            `;

        }).join("");

}


// ================================
// حذف سيارة
// ================================

function deleteCar(id) {

    let cars =
        JSON.parse(
            localStorage.getItem("carcost_cars")
        ) || [];


    cars =
        cars.filter(function(car) {

            return car.id !== id;

        });


    localStorage.setItem(
        "carcost_cars",
        JSON.stringify(cars)
    );


    displayCars();

    updateStatistics();

}


// ================================
// الإحصائيات
// ================================

function updateStatistics() {

    let cars =
        JSON.parse(
            localStorage.getItem("carcost_cars")
        ) || [];


    let totalCost = 0;
    let totalSale = 0;
    let totalProfit = 0;


    cars.forEach(function(car) {

        totalCost += Number(car.totalCost) || 0;

        totalSale += Number(car.salePrice) || 0;

        totalProfit += Number(car.profit) || 0;

    });


    document.getElementById("carCount")
        .textContent = cars.length;


    document.getElementById("allCost")
        .textContent = formatMoney(totalCost);


    document.getElementById("allSale")
        .textContent = formatMoney(totalSale);


    document.getElementById("allProfit")
        .textContent = formatMoney(totalProfit);

}


// ================================
// تنسيق الريال
// ================================

function formatMoney(number) {

    return Number(number).toLocaleString("ar-OM") + " ر.ع";

}


// ================================
// البحث بالـ VIN
// ================================

async function searchVIN() {

    const input =
        document.getElementById("vin");

    const vin =
        input.value
            .trim()
            .toUpperCase();


    if (vin.length !== 17) {

        alert(
            "رقم VIN يجب أن يكون 17 خانة."
        );

        return;
    }


    loading.classList.remove("hidden");

    report.classList.add("hidden");


    try {

        const response =
            await fetch(
                "/api/vin",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        vin: vin
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "فشل البحث"
            );

        }


        if (!data.data) {

            throw new Error(
                "لم يتم العثور على بيانات السيارة."
            );

        }


        displayReport(
            data.data,
            vin
        );


    } catch (error) {

        alert(
            "❌ " +
            error.message
        );


    } finally {

        loading.classList.add("hidden");

    }

}


// ================================
// عرض تقرير VIN
// ================================

function displayReport(car, vin) {

    document.getElementById("vinResult")
        .textContent = vin;


    document.getElementById("make")
        .textContent =
            car.make || "غير متوفر";


    document.getElementById("model")
        .textContent =
            car.model || "غير متوفر";


    document.getElementById("year")
        .textContent =
            car.year || "غير متوفر";


    const history =
        car.history || [];


    const accidents =
        document.getElementById("accidents");


    if (history.length === 0) {

        accidents.innerHTML =
            "⚪ لا توجد سجلات مزاد متاحة.";

    } else {

        accidents.innerHTML =
            history.map(function(item) {

                return `

                    <div class="history-item">

                        🏁
                        ${item.auction || "Copart"}

                        <br>

                        📅
                        ${item.sale_date || "-"}

                        <br>

                        💥 الضرر:
                        ${item.primary_damage || "-"}

                        <br>

                        💥 الضرر الثانوي:
                        ${item.secondary_damage || "-"}

                        <br>

                        📏 الممشى:
                        ${item.odometer || "-"}

                        <br>

                        🏷️ Title:
                        ${item.title_type || "-"}

                        <br>

                        💰 السعر:
                        ${item.final_bid || "-"}

                    </div>

                `;

            }).join("");

    }


    const mileage =
        document.getElementById("mileage");


    const mileageData =
        history.filter(function(item) {

            return item.odometer;

        });


    if (mileageData.length) {

        mileage.innerHTML =
            mileageData.map(function(item) {

                return `

                    <div class="history-item">

                        📅
                        ${item.sale_date || "-"}

                        <br>

                        📏
                        ${item.odometer}

                    </div>

                `;

            }).join("");

    } else {

        mileage.innerHTML =
            "⚪ لا توجد بيانات ممشى.";

    }


    const latest =
        history[history.length - 1];


    document.getElementById("titleStatus")
        .textContent =
            latest?.title_type ||
            "غير متوفر";


    const photos =
        document.getElementById("photos");


    const images =
        history.flatMap(function(item) {

            return item.photos || [];

        });


    if (images.length) {

        photos.innerHTML =
            images
                .slice(0, 12)
                .map(function(image) {

                    return `

                        <img
                            src="${image}"
                            class="car-image"
                        >

                    `;

                })
                .join("");

    } else {

        photos.innerHTML =
            "📸 لا توجد صور متاحة.";

    }


    document.getElementById("omanPrice")
        .textContent =
            "بانتظار بيانات السوق";


    document.getElementById("sellingPrice")
        .textContent =
            "بانتظار بيانات السوق";


    document.getElementById("totalCost")
        .textContent =
            "يُحسب بعد إدخال التكاليف";


    document.getElementById("expectedSale")
        .textContent =
            "يُحدد من السوق";


    document.getElementById("profit")
        .textContent =
            "يُحسب تلقائيًا";


    document.getElementById("dealScore")
        .textContent =
            "🧠 تقييم الصفقة: سيتم حسابه";


    report.classList.remove("hidden");

}


// ================================
// تشغيل الإحصائيات عند فتح الموقع
// ================================

updateStatistics();

displayCars();