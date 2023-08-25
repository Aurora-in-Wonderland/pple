import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { ReactComponent as SearchIcon } from "../../assets/images/search.svg";
import Categories from "../edit/Categories";
import pinIcon from "../../assets/images/icon_pin_3x.png";
import SearchModal from "../edit/SearchModal";

import axios from "axios";
import { postData, postCategoryData } from "../../api/map";

interface Location {
    placeName: string;
    latitude: string;
    longitude: string;
}

interface KakaoProps {
    isData: Location[]; // 데이터 구조에 따라 변경
    setIsData: React.Dispatch<React.SetStateAction<Location[]>>; // 데이터 구조에 따라 변경
    // latitude: string;
    // setLatitude: (latitude: string) => void;
    // longitude: string;
    // setLongitude: (longitude: string) => void;
}

const KakaoMap: React.FC<KakaoProps> = ({
    isData,
    setIsData,
    // , latitude, setLatitude, longitude, setLongitude
}) => {
    const [searchLocation, setSearchLocation] = useState<string>("");
    const [searchLocationList, setSearchLocationList] = useState<any>([]);
    const [geoLatitude, setGeoLatitude] = useState<string>("");
    const [geoLongitude, setGeoLongitude] = useState<string>("");
    const [latitude, setLatitude] = useState<string>("37.566826");
    const [longitude, setLongitude] = useState<string>("126.9786567");
    const [address, setAddress] = useState("");
    const [placeName, setPlaceName] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<any>({});
    const [categoryNum, setCategoryNum] = useState<number>(0);
    const [modal, setModal] = useState(false);

    const [selectedMarker, setSelectedMarker] = useState(null);

    const addMarkersToMap = (map: any, positions: any[]) => {
        const imageSrc = pinIcon;
        for (let i = 0; i < positions.length; i++) {
            const imageSize = new window.kakao.maps.Size(36, 42);
            const markerImage = new window.kakao.maps.MarkerImage(imageSrc, imageSize);

            const marker = new window.kakao.maps.Marker({
                map: map,
                position: positions[i].latlng,
                title: positions[i].title,
                image: markerImage,
            });
            marker.setMap(map);
        }
    };

    // 최초 GPS 위치 설정
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    const lat = String(position.coords.latitude);
                    const lng = String(position.coords.longitude);
                    setLatitude(lat);
                    setLongitude(lng);
                    setGeoLatitude(lat);
                    setGeoLongitude(lng);
                },
                (error) => {
                    console.error("error", error);
                }
            );
        } else {
            console.error("해당 브라우저에서는 gps를 지원하지 않습니다.");
        }
    }, []);

    // 마커 데이터 업데이트
    useEffect(() => {
        mappingList().then((res) => {
            window.kakao.maps.load(() => {
                const mapContainer = document.getElementById("map");
                const map = new window.kakao.maps.Map(mapContainer, {
                    center: new window.kakao.maps.LatLng(latitude, longitude),
                    level: 3,
                });
                // 좌표로 이동
                map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
                // 좌표에 있는 data로 markers에 넣을 배열 생성
                const position = res.map((item: any, index: number) => ({
                    key: index,
                    title: item.location.placeName,
                    latlng: new window.kakao.maps.LatLng(item.location.latitude, item.location.longitude),
                }));
                // 마커 추가 로직 호출
                addMarkersToMap(map, position);
            });
        });
    }, [latitude, longitude, geoLatitude, geoLongitude]);

    const mappingList = async () => {
        const latlng = { latitude, longitude };
        try {
            const response = await postData(latlng);
            console.log("!@#", response);
            setIsData(response?.data.content);
            return response?.data.content;
        } catch (error) {
            console.error(error);
        }
    };
    console.log(categoryNum);

    const mappingCategoryHandler = async () => {
        const categoryId = categoryNum;
        let latlng;

        if (categoryId !== 0) {
            latlng = { latitude, longitude };
        } else {
            latlng = { geoLatitude, geoLongitude };
        }

        try {
            const response = await postCategoryData(latlng, categoryId);
            setIsData(response?.data.content);
            console.log("isData", isData);

            const updatedPositions = response?.data.content.map((item: any) => ({
                key: item.id, // 적절한 키를 사용하세요
                title: item.location.placeName,
                latlng: new window.kakao.maps.LatLng(item.location.latitude, item.location.longitude),
            }));

            // 업데이트된 positions로 addMarkersToMap 호출
            window.kakao.maps.load(() => {
                const mapContainer = document.getElementById("map");
                const map = new window.kakao.maps.Map(mapContainer, {
                    center: new window.kakao.maps.LatLng(latitude, longitude),
                    level: 3,
                });
                map.panTo(new window.kakao.maps.LatLng(latitude, longitude));
                addMarkersToMap(map, updatedPositions);
            });

            return response?.data.content;
        } catch (error) {
            console.error(error);
        }
    };

    const searchMap = () => {
        const ps = new window.kakao.maps.services.Places();
        const placesSearchCB = function (data: any, status: any) {
            if (status === window.kakao.maps.services.Status.OK) {
                setSearchLocationList(data);
                setLatitude(selectedLocation.y); // 검색한 위치의 위도로 변경
                setLongitude(selectedLocation.x); // 검색한 위치의 경도로 변경
            }
        };
        ps.keywordSearch(searchLocation, placesSearchCB);
    };

    // console.log("이거 맞음", latitude, longitude);

    const changeInputHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchLocation(event.target.value);
    };

    const searchLocationHandler = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (searchLocation.trim().length === 0) {
            return alert("내용을 입력하세요");
        }
        setModal(true);
        setSearchLocation("");
        searchMap();
    };

    return (
        <>
            <script></script>
            <StMapContainer>
                <StSearchForm onSubmit={searchLocationHandler}>
                    <div>
                        <SearchIcon
                            style={{
                                width: "16px",
                                height: "16px",
                                marginLeft: "16px",
                                marginRight: "12px",
                            }}
                        />
                    </div>
                    <input
                        placeholder="장소를 입력해보세요"
                        onChange={changeInputHandler}
                        value={searchLocation}
                        id="keyword"
                    />
                </StSearchForm>
                {modal && (
                    <SearchModal
                        setModal={setModal}
                        searchLocationList={searchLocationList}
                        setAddress={setAddress}
                        setPlaceName={setPlaceName}
                        setLatitude={setLatitude}
                        setLongitude={setLongitude}
                        setSelectedLocation={setSelectedLocation}
                    />
                )}
                <StCategory onClick={mappingCategoryHandler}>
                    <Categories
                        categoryNum={categoryNum}
                        setCategoryNum={setCategoryNum}
                    />
                </StCategory>
                <StKakaoMap id="map" />
            </StMapContainer>
        </>
    );
};

export default KakaoMap;

const StMapContainer = styled.div`
    height: 548px;
`;

const StCategory = styled.div`
    margin: 16px 0 22px 0;
`;

const StSearchForm = styled.form`
    width: 346px;
    height: 40px;
    border: 1px solid #434047;
    background-color: #434047;
    border-radius: 999px;
    display: flex;
    flex-direction: row;
    align-items: center;
    input {
        width: 270px;
        height: 16px;
        color: #fafafa;
        border: 1px solid #434047;
        background-color: #434047;
    }
    input:focus {
        outline: none;
    }
`;

const StKakaoMap = styled.div`
    width: 347px;
    height: 308px;
    border-radius: 10px;
`;
