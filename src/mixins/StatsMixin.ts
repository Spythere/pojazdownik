import { IVehicleData, ILocomotive, ICarWagon, IStore } from "@/types";
import { defineComponent, inject } from "@vue/runtime-core";
import { computed } from "@vue/reactivity";

import vehicleDataJSON from "@/data/vehicleData.json";
import vehiclePropsJSON from "@/data/vehicleProps.json";

export default defineComponent({

    setup() {
        return {
            store: inject("Store") as IStore
        }
    },

    computed: {
        locoDataList() {
            return Object.keys(vehicleDataJSON).reduce(
                (acc, vehicleTypeKey) => {
                    if (!vehicleTypeKey.startsWith("loco")) return acc;

                    const locoVehiclesData = (vehicleDataJSON as IVehicleData)[
                        vehicleTypeKey
                    ];

                    locoVehiclesData.forEach((loco) => {
                        if (loco[4] && !this.store.showSupporter) return;

                        const locoType = loco[0] as string;

                        let length = 0,
                            mass = 0;

                        // Elektrowozy
                        if (vehicleTypeKey.startsWith("loco-e")) {
                            // 32m dla ET41, reszta 16
                            length = locoType.startsWith("ET") ? 32 : 16;

                            // 80t dla wszystkich EU06, EP08
                            mass = 80;

                            // 83t dla: EU07 o nr większych niż 300 & dla wszystkich EP07 oprócz nr 135,242,1002,1048
                            const locoNumber = Number(locoType.split("-")[1]);

                            if (
                                (locoType.startsWith("EU") && locoNumber > 300) ||
                                (locoType.startsWith("EP") &&
                                    ![242, 135, 1002, 1048].includes(locoNumber))
                            ) {
                                mass = 83;
                            }
                        }

                        // Spalinowozy
                        if (vehicleTypeKey.startsWith("loco-s")) {
                            length = 14;
                            mass = 74;
                        }

                        // EZT
                        if (vehicleTypeKey.startsWith("loco-ezt")) {
                            // EN57
                            length = 65;
                            mass = 126;

                            // EN71
                            if (locoType.startsWith("EN71")) {
                                length = 86;
                                mass = 182;
                            }

                            // 2xEN57
                            if (locoType.startsWith("2EN57")) {
                                length = 130;
                                mass = 253;
                            }
                        }

                        // SZT
                        if (vehicleTypeKey.startsWith("loco-szt")) {
                            length = 14;
                            mass = 23;
                        }

                        acc.push({
                            power: vehicleTypeKey,
                            type: loco[0] as string,
                            constructionType: loco[1] as string,
                            cabinType: loco[2] as string,
                            maxSpeed: Number(loco[3] as string),
                            supportersOnly: loco[4] as boolean,
                            imageSrc: loco[5] as string,

                            length,
                            mass,
                        });
                    });

                    return acc;
                },
                [] as ILocomotive[]
            );

        },

        carDataList() {
            return Object.keys(vehicleDataJSON).reduce(
                (acc, vehicleTypeKey) => {
                    if (!vehicleTypeKey.startsWith("car")) return acc;

                    const carVehiclesData = (vehicleDataJSON as IVehicleData)[
                        vehicleTypeKey
                    ];

                    carVehiclesData.forEach((car) => {
                        if (car[3] && !this.store.showSupporter) return;

                        const carPropsData = vehiclePropsJSON.find((v) =>
                            car[0].toString().includes(v.type)
                        );

                        acc.push({
                            useType: vehicleTypeKey,
                            type: car[0] as string,
                            constructionType: car[1] as string,
                            loadable: car[2] as boolean,
                            supportersOnly: car[3] as boolean,
                            maxSpeed: Number(car[4] as string),
                            imageSrc: car[5] as string,
                            cargoList:
                                carPropsData?.cargo.split(";").map((cargo) => ({
                                    id: cargo.split(":")[0],
                                    totalMass: Number(cargo.split(":")[1]),
                                })) || [],

                            mass: carPropsData?.mass || 0,
                            length: carPropsData?.length || 0,
                        });
                    });

                    return acc;
                },
                [] as ICarWagon[]
            );
        },
    }
});
